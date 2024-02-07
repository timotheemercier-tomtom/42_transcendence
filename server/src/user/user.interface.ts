interface AuthProfile {
  username: string;
  _json: {
    image: {
      link: string;
    };
  };
}

interface UserProfile {
  login: string;
  username: string;
  picture: string;
  isTwoFAenable: boolean;
}
