import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  last_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  avatar_url?: string;

  /** Qui peut vous envoyer un premier message (messagerie) */
  @IsOptional()
  @IsIn(['contacts_or_follow', 'followers', 'mutual', 'none', 'everyone'])
  privacy_dm_from?: 'contacts_or_follow' | 'followers' | 'mutual' | 'none' | 'everyone';

  /** Qui peut voir votre statut / activité (ex. stories) */
  @IsOptional()
  @IsIn(['everyone', 'followers', 'nobody'])
  privacy_status_visibility?: 'everyone' | 'followers' | 'nobody';

  /** Qui peut vous ajouter à un groupe (si déjà une conversation privée) */
  @IsOptional()
  @IsIn(['dm_only', 'none'])
  privacy_group_invite?: 'dm_only' | 'none';
}
