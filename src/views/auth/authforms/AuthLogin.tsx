import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import { Link, useNavigate } from 'react-router';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../../../lib/supabaseClient'; // pastikan path sesuai

const AuthLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const form = event.currentTarget;
    const email = (form.elements.namedItem('Username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('userpwd') as HTMLInputElement).value;

    // Proses login ke Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: error.message,
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Login Berhasil',
      text: 'Selamat datang kembali!',
      timer: 2000,
      showConfirmButton: false,
    });

    navigate('/');
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="Username" value="Email Address" />
          </div>
          <TextInput
            id="Username"
            type="email"
            sizing="md"
            required
            className="form-control form-rounded-xl"
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="userpwd" value="Password" />
          </div>
          <TextInput
            id="userpwd"
            type="password"
            sizing="md"
            required
            className="form-control form-rounded-xl"
          />
        </div>
        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox id="accept" className="checkbox" />
            <Label htmlFor="accept" className="opacity-90 font-normal cursor-pointer">
              Remember this Device
            </Label>
          </div>
          <Link to={'/'} className="text-primary text-sm font-medium">
            Forgot Password ?
          </Link>
        </div>
        <Button
          type="submit"
          color={'primary'}
          className="w-full bg-primary text-white rounded-xl"
          isProcessing={loading}
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
