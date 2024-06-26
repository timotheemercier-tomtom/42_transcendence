import { Get, Controller } from '@nestjs/common';
import { GameService } from './game.service';
import { MatchHistory } from './matchhistory.entity';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get('/matchhistory')
  async listMatchHistory(): Promise<MatchHistory[]> {
    return await this.gameService.findAllMatchHistory();
  }
}
