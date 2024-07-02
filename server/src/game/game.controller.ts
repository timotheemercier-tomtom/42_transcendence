import { Get, Controller, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { MatchHistory } from './matchhistory.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Get('/matchhistory')
  @UseGuards(JwtAuthGuard)
  async listMatchHistory(): Promise<MatchHistory[]> {
    return await this.gameService.findAllMatchHistory();
  }
}
