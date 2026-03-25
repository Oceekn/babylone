import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto, ReviewBookingDto, RescheduleBookingDto } from './dto/update-booking.dto';
import { WalletService } from '../wallet/wallet.service';
import { TransactionsService } from '../transactions/transactions.service';

const SLOT_STEP_MINUTES = 30;
const WORK_START_HOUR = 8;
const WORK_END_HOUR = 19;

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Professional)
    private professionalsRepository: Repository<Professional>,
    private walletService: WalletService,
    private transactionsService: TransactionsService,
  ) {}

  /** Vérifie qu'aucune réservation du professionnel ne chevauche le créneau */
  private async checkNoOverlap(professionalId: string, scheduledAt: Date, durationMinutes: number, excludeBookingId?: string): Promise<void> {
    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + (durationMinutes || 60) * 60 * 1000);
    const existing = await this.bookingsRepository.find({
      where: {
        professional_id: professionalId,
        status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]),
      },
    });
    for (const b of existing) {
      if (excludeBookingId && b.id === excludeBookingId) continue;
      const bStart = new Date(b.scheduled_at);
      const bEnd = new Date(bStart.getTime() + (b.duration_minutes || 60) * 60 * 1000);
      if (start.getTime() < bEnd.getTime() && end.getTime() > bStart.getTime()) {
        throw new BadRequestException('Ce créneau est déjà pris. Choisissez une autre date ou heure.');
      }
    }
  }

  async create(clientId: string, dto: CreateBookingDto): Promise<Booking> {
    await this.checkNoOverlap(
      dto.professional_id,
      new Date(dto.scheduled_at),
      dto.duration_minutes || 60,
    );
    const booking = this.bookingsRepository.create({
      client_id: clientId,
      professional_id: dto.professional_id,
      service_id: dto.service_id,
      scheduled_at: new Date(dto.scheduled_at),
      duration_minutes: dto.duration_minutes,
      price: dto.price,
      currency: dto.currency || 'XAF',
      notes: dto.notes,
      address: dto.address,
      status: BookingStatus.PENDING,
    });
    return this.bookingsRepository.save(booking);
  }

  // Creer une reservation avec paiement simule (debite le wallet)
  async createWithPayment(clientId: string, dto: CreateBookingDto): Promise<{ booking: Booking; transaction: any }> {
    const price = dto.price || 0;
    if (price <= 0) {
      throw new BadRequestException('Le prix doit etre positif');
    }
    await this.checkNoOverlap(
      dto.professional_id,
      new Date(dto.scheduled_at),
      dto.duration_minutes || 60,
    );

    // Verifier le solde
    const hasFunds = await this.walletService.hasSufficientBalance(clientId, price);
    if (!hasFunds) {
      throw new BadRequestException('Solde insuffisant dans le portefeuille');
    }

    // Creer la reservation en attente : le pro confirmera ou refusera
    const booking = this.bookingsRepository.create({
      client_id: clientId,
      professional_id: dto.professional_id,
      service_id: dto.service_id,
      scheduled_at: new Date(dto.scheduled_at),
      duration_minutes: dto.duration_minutes,
      price,
      currency: dto.currency || 'XAF',
      notes: dto.notes,
      address: dto.address,
      status: BookingStatus.PENDING,
    });
    const savedBooking = await this.bookingsRepository.save(booking);

    // Debiter le wallet et creer la transaction
    const transaction = await this.transactionsService.createPayment(
      clientId,
      price,
      `Paiement reservation #${savedBooking.id.substring(0, 8)}`,
      { booking_id: savedBooking.id },
    );

    return { booking: savedBooking, transaction };
  }

  // Stats pour le dashboard professionnel
  async getProfessionalStats(userId: string): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Reservations du jour
    const todayBookings = await this.bookingsRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.client', 'client')
      .leftJoinAndSelect('b.service', 'service')
      .leftJoinAndSelect('b.professional', 'professional')
      .leftJoin('professional.user', 'proUser')
      .where('proUser.id = :userId', { userId })
      .andWhere('b.scheduled_at >= :today', { today: today.toISOString() })
      .andWhere('b.scheduled_at < :tomorrow', { tomorrow: tomorrow.toISOString() })
      .orderBy('b.scheduled_at', 'ASC')
      .getMany();

    // Revenus du mois
    const monthRevenue = await this.bookingsRepository
      .createQueryBuilder('b')
      .leftJoin('b.professional', 'professional')
      .leftJoin('professional.user', 'proUser')
      .select('COALESCE(SUM(b.price), 0)', 'total')
      .where('proUser.id = :userId', { userId })
      .andWhere('b.status = :status', { status: 'completed' })
      .andWhere('b.created_at >= :monthStart', { monthStart: monthStart.toISOString() })
      .getRawOne();

    // Note moyenne
    const avgRating = await this.bookingsRepository
      .createQueryBuilder('b')
      .leftJoin('b.professional', 'professional')
      .leftJoin('professional.user', 'proUser')
      .select('AVG(b.rating)', 'avg')
      .addSelect('COUNT(b.rating)', 'count')
      .where('proUser.id = :userId', { userId })
      .andWhere('b.rating IS NOT NULL')
      .getRawOne();

    return {
      todayBookings,
      todayCount: todayBookings.length,
      monthRevenue: parseFloat(monthRevenue?.total || '0'),
      avgRating: parseFloat(avgRating?.avg || '0'),
      totalReviews: parseInt(avgRating?.count || '0'),
    };
  }

  /**
   * Compteur pour la pastille « Réservations » : toutes les demandes en attente
   * + les réservations du jour (confirmées ou en cours), sans doublon.
   */
  async getProNavBadge(userId: string): Promise<{ badge: number; pending: number; todayActive: number }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const t0 = today.toISOString();
    const t1 = tomorrow.toISOString();

    const pending = await this.bookingsRepository
      .createQueryBuilder('b')
      .leftJoin('b.professional', 'professional')
      .leftJoin('professional.user', 'proUser')
      .where('proUser.id = :userId', { userId })
      .andWhere('b.status = :st', { st: BookingStatus.PENDING })
      .getCount();

    const todayActive = await this.bookingsRepository
      .createQueryBuilder('b')
      .leftJoin('b.professional', 'professional')
      .leftJoin('professional.user', 'proUser')
      .where('proUser.id = :userId', { userId })
      .andWhere('b.scheduled_at >= :t0', { t0 })
      .andWhere('b.scheduled_at < :t1', { t1 })
      .andWhere('b.status IN (:...sts)', {
        sts: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS],
      })
      .getCount();

    const badge = await this.bookingsRepository
      .createQueryBuilder('b')
      .leftJoin('b.professional', 'professional')
      .leftJoin('professional.user', 'proUser')
      .where('proUser.id = :userId', { userId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('b.status = :pending', { pending: BookingStatus.PENDING }).orWhere(
            new Brackets((qb2) => {
              qb2
                .where('b.scheduled_at >= :t0', { t0 })
                .andWhere('b.scheduled_at < :t1', { t1 })
                .andWhere('b.status IN (:...daySts)', {
                  daySts: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS],
                });
            }),
          );
        }),
      )
      .getCount();

    return { badge, pending, todayActive };
  }

  // Avis recus par le professionnel (par user_id, pour le dashboard pro)
  async getReviewsReceived(userId: string): Promise<Booking[]> {
    return this.bookingsRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.client', 'client')
      .leftJoinAndSelect('b.service', 'service')
      .leftJoinAndSelect('b.professional', 'professional')
      .leftJoin('professional.user', 'proUser')
      .where('proUser.id = :userId', { userId })
      .andWhere('b.rating IS NOT NULL')
      .orderBy('b.updated_at', 'DESC')
      .getMany();
  }

  // Avis d'un professionnel par professional_id (pour la page publique)
  async getReviewsByProfessionalId(professionalId: string): Promise<Booking[]> {
    return this.bookingsRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.client', 'client')
      .leftJoinAndSelect('b.service', 'service')
      .where('b.professional_id = :professionalId', { professionalId })
      .andWhere('b.rating IS NOT NULL')
      .orderBy('b.updated_at', 'DESC')
      .getMany();
  }

  async findByClient(clientId: string, status?: string): Promise<Booking[]> {
    const qb = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.professional', 'professional')
      .leftJoinAndSelect('professional.user', 'proUser')
      .leftJoinAndSelect('booking.service', 'service')
      .where('booking.client_id = :clientId', { clientId })
      .orderBy('booking.scheduled_at', 'DESC');

    if (status) {
      qb.andWhere('booking.status = :status', { status });
    }

    return qb.getMany();
  }

  async findByProfessional(userId: string, status?: string): Promise<Booking[]> {
    // On cherche par user_id du professional (via la relation)
    const qb = this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.client', 'client')
      .leftJoinAndSelect('booking.service', 'service')
      .leftJoinAndSelect('booking.professional', 'professional')
      .leftJoin('professional.user', 'proUser')
      .where('proUser.id = :userId', { userId })
      .orderBy('booking.scheduled_at', 'DESC');

    if (status) {
      qb.andWhere('booking.status = :status', { status });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['client', 'professional', 'professional.user', 'service'],
    });
    if (!booking) {
      throw new NotFoundException('Reservation introuvable');
    }
    return booking;
  }

  /** Créneaux disponibles pour un professionnel à une date (horaires configurables sur la fiche pro, pas 30 min) */
  async getAvailability(professionalId: string, dateStr: string): Promise<{ time: string }[]> {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Date invalide');
    }
    const prof = await this.professionalsRepository.findOne({ where: { id: professionalId } });
    let startH = prof?.work_start_hour ?? WORK_START_HOUR;
    let endH = prof?.work_end_hour ?? WORK_END_HOUR;
    if (typeof startH !== 'number' || startH < 0 || startH > 23) startH = WORK_START_HOUR;
    if (typeof endH !== 'number' || endH < 0 || endH > 23) endH = WORK_END_HOUR;
    if (endH <= startH) {
      endH = Math.min(23, startH + 1);
    }
    const dayStart = new Date(date);
    dayStart.setHours(startH, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(endH, 0, 0, 0);

    const bookings = await this.bookingsRepository.find({
      where: {
        professional_id: professionalId,
        status: In([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]),
      },
    });
    const busy: { start: number; end: number }[] = [];
    for (const b of bookings) {
      const bStart = new Date(b.scheduled_at);
      const bEnd = new Date(bStart.getTime() + (b.duration_minutes || 60) * 60 * 1000);
      if (bEnd > dayStart && bStart < dayEnd) {
        busy.push({
          start: Math.max(bStart.getTime(), dayStart.getTime()),
          end: Math.min(bEnd.getTime(), dayEnd.getTime()),
        });
      }
    }

    const slots: { time: string }[] = [];
    let slotStart = dayStart.getTime();
    while (slotStart + SLOT_STEP_MINUTES * 60 * 1000 <= dayEnd.getTime()) {
      const slotEnd = slotStart + (SLOT_STEP_MINUTES * 60 * 1000);
      const isBusy = busy.some((b) => slotStart < b.end && slotEnd > b.start);
      if (!isBusy) {
        const d = new Date(slotStart);
        const h = d.getHours();
        const m = d.getMinutes();
        slots.push({ time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}` });
      }
      slotStart = slotEnd;
    }
    return slots;
  }

  async updateStatus(
    id: string,
    userId: string,
    dto: UpdateBookingStatusDto,
  ): Promise<Booking> {
    const booking = await this.findById(id);

    // Verifier les permissions
    const isClient = booking.client_id === userId;
    const isProfessional = booking.professional?.user_id === userId;
    if (!isClient && !isProfessional) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cette reservation');
    }

    // Verifier les transitions valides
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled', 'rejected'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
    };

    const allowed = validTransitions[booking.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Impossible de passer de "${booking.status}" a "${dto.status}"`,
      );
    }

    // Seul le professionnel peut confirmer/rejeter/completer
    if (['confirmed', 'rejected', 'in_progress', 'completed'].includes(dto.status) && !isProfessional) {
      throw new ForbiddenException('Seul le professionnel peut effectuer cette action');
    }

    const previousStatus = booking.status;
    booking.status = dto.status as BookingStatus;
    if (dto.cancellation_reason) {
      booking.cancellation_reason = dto.cancellation_reason;
    }

    const saved = await this.bookingsRepository.save(booking);

    // Remboursement si annulation/refus après un paiement wallet
    if ((dto.status === 'cancelled' || dto.status === 'rejected') && booking.price && booking.price > 0) {
      const paymentTx = await this.transactionsService.findByBookingId(booking.id);
      if (paymentTx) {
        const amount = parseFloat(paymentTx.amount.toString());
        try {
          await this.transactionsService.createRefund(
            booking.client_id,
            amount,
            `Remboursement réservation #${booking.id.substring(0, 8)}`,
            { booking_id: booking.id },
          );
        } catch (refundErr) {
          // Log but do not fail the status update
          console.error('Refund failed for booking', booking.id, refundErr);
        }
      }
    }

    return saved;
  }

  async reschedule(id: string, userId: string, dto: RescheduleBookingDto): Promise<Booking> {
    const booking = await this.findById(id);
    const isClient = booking.client_id === userId;
    const isProfessional = booking.professional?.user_id === userId;
    if (!isClient && !isProfessional) {
      throw new ForbiddenException('Vous ne pouvez pas modifier cette reservation');
    }
    if (booking.status !== BookingStatus.PENDING && booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Seules les réservations en attente ou confirmées peuvent être reportées');
    }
    const newDate = new Date(dto.scheduled_at);
    if (isNaN(newDate.getTime())) {
      throw new BadRequestException('Date invalide');
    }
    const duration = booking.duration_minutes || 60;
    await this.checkNoOverlap(booking.professional_id, newDate, duration, id);
    booking.scheduled_at = newDate;
    return this.bookingsRepository.save(booking);
  }

  async addReview(
    id: string,
    clientId: string,
    dto: ReviewBookingDto,
  ): Promise<Booking> {
    const booking = await this.findById(id);

    if (booking.client_id !== clientId) {
      throw new ForbiddenException('Seul le client peut laisser un avis');
    }
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('La reservation doit etre terminee pour laisser un avis');
    }
    if (booking.rating) {
      throw new BadRequestException('Un avis a deja ete laisse');
    }

    booking.rating = dto.rating;
    booking.review = dto.review;

    return this.bookingsRepository.save(booking);
  }
}
