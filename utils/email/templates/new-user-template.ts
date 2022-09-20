import { Template } from '../../../types';
import { config } from '../../../config/config';


const baseUrl = config.NODE_ENV === 'develop' ? 'http://localhost:3000' : 'https://habit-tracker.networkmanager.pl/';

export const newUserTemplate = (token: string): Template => {
  const subject = 'Confirm your account.';
  const body = `
<h1>Confirm your account</h1>
<a href="${ baseUrl }/register/verify/${ token }">Click to verifiy</a>
<p>${ baseUrl }/register/verify/${ token }</p>
`;
  return { subject, body };
};
