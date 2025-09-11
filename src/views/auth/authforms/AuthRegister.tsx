import { Button, Label, TextInput } from 'flowbite-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import Swal from 'sweetalert2';
import { supabase } from '../../../lib/supabaseClient'; // pastikan path benar

const AuthRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('emadd') as string;
    const password = formData.get('userpwd') as string;

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }, // simpan nama di metadata
        emailRedirectTo: `${window.location.origin}/auth/verify`, // halaman redirect setelah verifikasi
      },
    });

    setLoading(false);

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: error.message,
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Check Your Email',
      text: 'We have sent you a verification link. Please check your inbox.',
    }).then(() => {
      navigate('/auth/login');
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="name" value="Name" />
        </div>
        <TextInput
          id="name"
          name="name"
          type="text"
          sizing="md"
          required
          className="form-control form-rounded-xl"
        />
      </div>

      <div className="mb-4">
        <div className="mb-2 block">
          <Label htmlFor="emadd" value="Email Address" />
        </div>
        <TextInput
          id="emadd"
          name="emadd"
          type="email"
          sizing="md"
          required
          className="form-control form-rounded-xl"
        />
      </div>

      <div className="mb-6">
        <div className="mb-2 block">
          <Label htmlFor="userpwd" value="Password" />
        </div>
        <TextInput
          id="userpwd"
          name="userpwd"
          type="password"
          sizing="md"
          required
          className="form-control form-rounded-xl"
        />
      </div>

      <Button color={'primary'} type="submit" className="w-full" disabled={loading}>
        {loading ? 'Processing...' : 'Sign Up'}
      </Button>
    </form>
  );
};

export default AuthRegister;
