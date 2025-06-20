import { FetchUsersResponseDto } from '~/modules/user/dto/fetch-user.dto';
import { IBaseListingResult } from './base-listing-result.interface';

export type UserResult = IBaseListingResult<FetchUsersResponseDto>;
