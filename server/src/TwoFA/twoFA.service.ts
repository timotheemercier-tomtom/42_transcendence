import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';

interface TwoFactorStatusResponse {
  enabled: boolean;
}

@Injectable()
export class TwoFAService {
  private readonly apiUrl = 'https://profile.intra.42.fr';

  constructor(private readonly httpService: HttpService) {}

  async enable2FA(userToken: string, password: string): Promise<void> {
    const url = `${this.apiUrl}/otp_settings/new`;
    const data = new URLSearchParams({
      'users[password]': password,
    });

    try {
      const response: AxiosResponse = await firstValueFrom(this.httpService.post(url, data.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRF-Token': userToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        withCredentials: true,
      }));

      if (response.status !== 200) {
        throw new HttpException('Failed to enable 2FA', response.status);
      }
    } catch (error) {
      throw new HttpException('Failed to enable 2FA', error.response?.status || 500);
    }
  }

  async disable2FA(userToken: string, password: string): Promise<void> {
    const url = `${this.apiUrl}/otp_settings/deactivate`;
    const data = new URLSearchParams({
      'users[password]': password,
    });

    try {
      const response: AxiosResponse = await firstValueFrom(this.httpService.post(url, data.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRF-Token': userToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        withCredentials: true,
      }));

      if (response.status !== 200) {
        throw new HttpException('Failed to disable 2FA', response.status);
      }
    } catch (error) {
      throw new HttpException('Failed to disable 2FA', error.response?.status || 500);
    }
  }

  async is2FAEnabled(userId: string, userToken: string): Promise<boolean> {
    const url = `${this.apiUrl}/v2/users/${userId}/otp_settings`;

    try {
      const response: AxiosResponse<TwoFactorStatusResponse> = await firstValueFrom(this.httpService.get(url, {
        headers: {
          'X-CSRF-Token': userToken,
        },
        withCredentials: true,
      }));

      return response.data.enabled;
    } catch (error) {
      throw new HttpException('Failed to fetch 2FA status', error.response?.status || 500);
    }
  }
}
