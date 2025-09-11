import { useState, useEffect } from 'react';
import { Label, TextInput, Button } from 'flowbite-react';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { supabase } from '../../lib/supabaseClient';

const EditClient = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [namaClient, setNamaClient] = useState('');
  const [tanggalClient, setTanggalClient] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Ambil data client berdasarkan ID
  useEffect(() => {
    const fetchClient = async () => {
      setLoadingData(true);
      const { data, error } = await supabase.from('clients').select('*').eq('id', id).single();

      if (error) {
        Swal.fire({ icon: 'error', title: 'Gagal memuat data', text: error.message });
        navigate('/clients');
        return;
      }

      setNamaClient(data.nama_client);
      setTanggalClient(data.tanggal_client);

      if (data.logo_url) {
        const { data: urlData } = supabase.storage.from('clients').getPublicUrl(data.logo_url);
        setPreviewImage(urlData?.publicUrl || null);
      }

      setLoadingData(false);
    };

    if (id) fetchClient();
  }, [id, navigate]);

  // Ganti logo preview saat memilih file baru
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  // Proses update client
  const handleSubmit = async () => {
    try {
      if (!namaClient || !tanggalClient) {
        Swal.fire({ icon: 'warning', title: 'Lengkapi semua data' });
        return;
      }

      setLoading(true);

      let logoPath = null;

      // Jika user upload logo baru
      if (logoFile) {
        logoPath = `logos/${Date.now()}_${logoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('clients')
          .upload(logoPath, logoFile, { upsert: true });

        if (uploadError) throw uploadError;
      }

      // Update data di database
      const { error: updateError } = await supabase
        .from('clients')
        .update({
          nama_client: namaClient,
          tanggal_client: tanggalClient,
          ...(logoPath && { logo_url: logoPath }),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Client berhasil diperbarui.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/clients');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui client',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 w-full">
      <h5 className="card-title">Edit Client</h5>

      {loadingData ? (
        // Skeleton loading
        <div className="animate-pulse mt-6 flex flex-col gap-4">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
          <div className="w-32 h-32 bg-gray-300 rounded-full"></div>
          <div className="h-10 bg-gray-300 rounded w-1/4"></div>
        </div>
      ) : (
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

          {/* Upload Logo */}
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
              {loading ? 'Menyimpan...' : 'Update'}
            </Button>
            <Button color="error" onClick={() => navigate('/clients')} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditClient;
