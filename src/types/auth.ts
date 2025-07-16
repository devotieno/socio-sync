export interface ConnectedAccount {
  accountId: string;
  platform: string;
  username: string;
  email?: string;
  avatar?: string;
  accessToken: string;
  refreshToken?: string;
  isDefault?: boolean;
  connectedAt: Date;
}
