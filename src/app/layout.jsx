import './globals.css';

export const metadata = {
  title: 'PC DSA Mentor — palakchandak8',
  description: 'AI-powered DSA tutor by Palak Chandak. Learn Data Structures & Algorithms from Beginner to Advanced — free.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
