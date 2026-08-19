import { PageLayout } from '../components/ui/PageLayout';

export default function Terms() {
  return (
    <PageLayout title="Terms of Service">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using Randall, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.
      </p>
      <h2>2. Age Requirement</h2>
      <p>
        You must be at least 18 years of age to use Randall. By using the service, you represent and warrant that you are 18 or older.
      </p>
      <h2>3. User Conduct</h2>
      <p>
        You agree to use Randall only for lawful purposes. You agree not to take any action that might compromise the security of the site, render the site inaccessible to others, or otherwise cause damage to the site or its content. You agree not to use the site in any manner that might interfere with the rights of third parties.
      </p>
      <p>
        Specifically, you agree not to:
      </p>
      <ul>
        <li>Share nudity or sexually explicit content</li>
        <li>Harass, abuse, or threaten others</li>
        <li>Share illegal content</li>
        <li>Spam or advertise</li>
      </ul>
      <h2>4. Disclaimer of Warranties</h2>
      <p>
        The service is provided on an "as is" and "as available" basis without any warranties of any kind. We do not guarantee that the service will be uninterrupted or error-free.
      </p>
    </PageLayout>
  );
}
