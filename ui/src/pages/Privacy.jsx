import { PageLayout } from '../components/ui/PageLayout';

export default function Privacy() {
  return (
    <PageLayout title="Privacy Policy">
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <h2>1. Information We Collect</h2>
      <p>
        Randall does not require an account to use. We do not ask for your name, email address, or phone number. We do not store your video or text chats. 
      </p>
      <p>
        We may collect non-personally identifiable information such as browser type, operating system, and IP address for the purpose of maintaining server security and enforcing bans for users who violate our Terms of Service.
      </p>
      <h2>2. How We Use Information</h2>
      <p>
        Any data we collect is used solely for the operation of the service, such as matching you with other users based on your selected interests, and for preventing abuse.
      </p>
      <h2>3. Third-Party Services</h2>
      <p>
        We use WebRTC for peer-to-peer video communication. In some cases, your IP address may be visible to the person you are chatting with due to the nature of peer-to-peer connections.
      </p>
      <h2>4. Changes to This Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
      </p>
    </PageLayout>
  );
}
