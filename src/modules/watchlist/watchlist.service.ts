import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Watchlist } from './models/watchlist.model';
import { CreateAssetResponse } from './response';

@Injectable()
export class WatchlistService {
  constructor(
    @InjectModel(Watchlist)
    private readonly watchlistRepository: typeof Watchlist,
  ) {}

  async createAsset(user, dto): Promise<CreateAssetResponse> {
    try {
      const watchList = {
        user: user.id,
        name: dto.name,
        assetId: dto.assetId,
      };
      await this.watchlistRepository.create(watchList);
      return watchList;
    } catch (error) {
      console.error('Create asset error:', error);
      throw new InternalServerErrorException(
        'Error creating asset in watchlist',
      );
    }
  }

  async deleteAsset(userId: number, assetId: string): Promise<boolean> {
    try {
      const deletedRows = await this.watchlistRepository.destroy({
        where: { user: userId, id: assetId },
      });

      if (deletedRows === 0) {
        throw new NotFoundException('Asset not found for deletion');
      }

      return true;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Delete asset error:', error);
      throw new InternalServerErrorException(
        'Error deleting asset from watchlist',
      );
    }
  }
}
