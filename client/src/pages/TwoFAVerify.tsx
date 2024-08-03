import { useState, FormEvent } from 'react';
import { API } from '../util';
import { useParams } from 'react-router-dom';

export default function TwoFAVerify() {
  const [twoFAToken, setTwoFAToken] = useState(0);
  const { login } = useParams<{ login: string }>();
  const handleVerificationSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const res = await fetch(
      `${API}/auth/${login}/${twoFAToken}/2fa/verify`,
      {
        method: 'POST',
        credentials: 'include',
      },
    );
    const redir_url = await res.text();
    location.href = (redir_url);
  };

  const verifcationOnChangeHandler = (event: FormEvent<HTMLInputElement>) => {
    if (event.currentTarget.value == '') {
      setTwoFAToken(0);
    } else {
      setTwoFAToken(event.currentTarget.valueAsNumber);
    }
  };

  return (
    <>
      <h2>2FA Verification Code</h2>
      <form onSubmit={handleVerificationSubmit}>
        <label>
          VerificationCode:
          <input
            id="verifcation-code"
            type="number"
            value={twoFAToken}
            onChange={verifcationOnChangeHandler}
          />
        </label>
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
