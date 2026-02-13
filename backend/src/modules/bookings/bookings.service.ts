import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto, ReviewBookingDto } from './dto/update-booking.dto';
import { WalletService } from '../wallet/wallet.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    private walletService: WalletService,
    private transactionsService: TransactionsService,
  ) {}

  async create(clientId: string, dto: CreateBookingDto): Promise<Booking> {
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

    // Verifier le solde
    const hasFunds = await this.walletService.hasSufficientBalance(clientId, price);
    if (!hasFunds) {
      throw new BadRequestException('Solde insuffisant dans le portefeuille');
    }

    // Creer la reservation
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
      status: BookingStatus.CONFIRMED,
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

    booking.status = dto.status as BookingStatus;
    if (dto.cancellation_reason) {
      booking.cancellation_reason = dto.cancellation_reason;
    }

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
