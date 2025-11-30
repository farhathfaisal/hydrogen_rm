import {LandingPage} from '~/components/LandingPage';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Amira | A Coat for Your Heritage'},
    {name: 'description', content: 'Amira is a coat designed to complement the elegance of salwar kameez, saris, abayas, and other ethnic attire. Sign up to be the first to know.'},
  ];
};

/**
 * Tell the layout to hide the header/footer for the landing page
 */
export const handle = {
  isLandingPage: true,
};

export default function Homepage() {
  return <LandingPage />;
}

/** @typedef {import('./+types/_index').Route} Route */
