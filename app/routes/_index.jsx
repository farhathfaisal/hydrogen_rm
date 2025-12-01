import {LandingPage} from '~/components/LandingPage';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {title: 'Rani Mode'},
    {
      name: 'description',
      content:
        "We're creating a new style of coat, purposefully designed to complement your cultural clothes and keep you warm and stylish.",
    },
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
