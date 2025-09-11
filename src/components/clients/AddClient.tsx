import { useState } from 'react';
import { Label, TextInput, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabaseClient';

const AddClient = () => {
  const navigate = useNavigate();

  const [namaClient, setNamaClient] = useState('');
  const [tanggalClient, setTanggalClient] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!namaClient || !tanggalClient || !logoFile) {
        Swal.fire({ icon: 'warning', title: 'Lengkapi semua data' });
        return;
      }

      setLoading(true);

      // 1. Upload logo ke Supabase Storage
      const filePath = `logos/${Date.now()}_${logoFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('clients') // pastikan ada bucket 'clients' di Supabase Storage
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      // 2. Simpan data client ke tabel
      const { error: insertError } = await supabase.from('clients').insert([
        {
          nama_client: namaClient,
          tanggal_client: tanggalClient,
          logo_url: uploadData?.path,
        },
      ]);

      if (insertError) throw insertError;

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Client berhasil ditambahkan.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/clients');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal menambahkan client',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 w-full">
      <h5 className="card-title">Tambah Client</h5>

      <div className="mt-6 flex flex-col gap-4">
        {/* Nama Client */}
        <div>
          <Label htmlFor="namaClient" value="Nama Client" className="mb-2 block" />
          <TextInput
            id="namaClient"
            type="text"
            placeholder="Masukkan nama client..."
            required
            value={namaClient}
            onChange={(e) => setNamaClient(e.target.value)}
          />
        </div>

        {/* Tanggal Menjadi Client */}
        <div>
          <Label htmlFor="tanggalClient" value="Tanggal Menjadi Client" className="mb-2 block" />
          <TextInput
            id="tanggalClient"
            type="date"
            required
            value={tanggalClient}
            onChange={(e) => setTanggalClient(e.target.value)}
          />
        </div>

        {/* Upload Logo Perusahaan */}
        <div>
          <Label htmlFor="logo" value="Logo Perusahaan / Instansi" className="mb-2 block" />

          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview Logo"
              className="w-32 h-32 object-cover rounded-full border mb-3"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center border rounded-full bg-gray-50 text-gray-400 mb-3">
              Preview Logo
            </div>
          )}

          <input
            id="logo"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
          />
        </div>

        {/* Tombol Aksi */}
        <div className="flex gap-3 mt-4">
          <Button color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Submit'}
          </Button>
          <Button color="error" onClick={() => navigate('/clients')} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddClient;
