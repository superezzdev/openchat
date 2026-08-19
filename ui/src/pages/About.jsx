import { PageLayout } from '../components/ui/PageLayout';

export default function About() {
  return (
    <PageLayout title="About Us">
      <p>
        Randall was built with one simple goal: to make meeting new people online as frictionless and fun as possible. In a world full of algorithms and curated feeds, we believe in the magic of random human connection.
      </p>
      <h2>Our Mission</h2>
      <p>
        We aim to provide a safe, fast, and completely free alternative to platforms like Omegle. We don't require accounts, we don't track your conversations, and we don't store your personal data. 
      </p>
      <h2>Open Source</h2>
      <p>
        Transparency is important to us. That's why Randall is open source. You can view our code, contribute to the project, or even host your own instance. We believe that open software builds trust and better communities.
      </p>
      <p>
        Ready to meet someone new? Just click "Start chatting" on the home page.
      </p>
    </PageLayout>
  );
}
