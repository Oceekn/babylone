import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto, ReviewBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // Creer une reservation (client)
  @Post()
  async create(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.id, dto);
  }

  // Creer une reservation avec paiement simule
  @Post('with-payment')
  async createWithPayment(@Request() req, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createWithPayment(req.user.id, dto);
  }

  // Stats dashboard professionnel
  @Get('stats')
  async stats(@Request() req) {
    return this.bookingsService.getProfessionalStats(req.user.id);
  }

  // Avis recus par le professionnel
  @Get('reviews-received')
  async reviewsReceived(@Request() req) {
    return this.bookingsService.getReviewsReceived(req.user.id);
  }

  // Mes reservations en tant que client
  @Get('my-bookings')
  async myBookings(@Request() req, @Query('status') status?: string) {
    return this.bookingsService.findByClient(req.user.id, status);
  }

  // Reservations recues en tant que professionnel
  @Get('received')
  async receivedBookings(@Request() req, @Query('status') status?: string) {
    return this.bookingsService.findByProfessional(req.user.id, status);
  }

  // Avis d'un professionnel par professional_id (page publique)
  @Get('professional/:professionalId/reviews')
  async professionalReviews(@Param('professionalId') professionalId: string) {
    return this.bookingsService.getReviewsByProfessionalId(professionalId);
  }

  // Detail d'une reservation
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  // Mettre a jour le statut (confirmer, annuler, etc.)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(id, req.user.id, dto);
  }

  // Laisser un avis (client uniquement, apres completion)
  @Post(':id/review')
  async addReview(
    @Param('id') id: string,
    @Request() req,
    @Body() dto: ReviewBookingDto,
  ) {
    return this.bookingsService.addReview(id, req.user.id, dto);
  }
}
