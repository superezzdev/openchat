import { PageLayout } from '../components/ui/PageLayout';

export default function Contact() {
  return (
    <PageLayout title="Contact Us">
      <p>
        We'd love to hear from you! Whether you have a question about the service, a bug report, or a business inquiry, you can reach out to us.
      </p>
      <h2>Email</h2>
      <p>
        For general inquiries and support, please email us at: <a href="mailto:support@randall.superezz.dev">support@randall.superezz.dev</a>
      </p>
      <h2>Open Source Contributions</h2>
      <p>
        If you want to report a technical issue or contribute to the code, please visit our <a href="https://github.com/superezzdev/openchat" target="_blank" rel="noreferrer">GitHub repository</a> and open an issue or pull request.
      </p>
      <h2>Social Media</h2>
      <p>
        Follow us for updates and news.
      </p>
    </PageLayout>
  );
}
