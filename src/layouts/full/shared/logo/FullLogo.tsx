import Logo from '/logo.jpg';
import { Link } from 'react-router-dom';

const FullLogo = () => {
  return (
    <Link to={'/'} className="flex flex-col items-center text-center">
      <img
        src={Logo}
        alt="logo"
        className="h-20 w-auto mb-2" // Logo tinggi 80px, jarak bawah 8px
      />
      <h1 className="text-lg font-semibold">Indo Caris International</h1>
    </Link>
  );
};

export default FullLogo;
