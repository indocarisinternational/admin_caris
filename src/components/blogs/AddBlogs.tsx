import { useState } from 'react';
import { Label, TextInput, Textarea, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

const AddBlog = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    judul: '',
    createdAt: '',
    updatedAt: '',
    isiBlog: '',
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.judul || !formData.createdAt || !formData.updatedAt || !formData.isiBlog) {
        Swal.fire({
          icon: 'warning',
          title: 'Lengkapi semua data',
        });
        return;
      }

      if (!bannerFile) {
        Swal.fire({
          icon: 'warning',
          title: 'Harap upload banner blog',
        });
        return;
      }

      setLoading(true);

      // Upload banner ke supabase storage
      const filePath = `banners/${Date.now()}_${bannerFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blogs') // pastikan kamu sudah buat bucket 'blogs' di supabase storage
        .upload(filePath, bannerFile);

      if (uploadError) throw uploadError;

      // Simpan data blog ke tabel 'blogs'
      const { error: insertError } = await supabase.from('blogs').insert([
        {
          judul: formData.judul,
          created_at: formData.createdAt,
          updated_at: formData.updatedAt,
          isi: formData.isiBlog,
          banner_url: uploadData?.path,
        },
      ]);

      if (insertError) throw insertError;

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Blog berhasil ditambahkan.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/blogs');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal menambahkan blog',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 w-full">
      <h5 className="card-title">Tambah Blog</h5>

      <div className="mt-6 flex flex-col gap-4">
        {/* Judul Blog */}
        <div>
          <Label htmlFor="judul" value="Judul Blog" className="mb-2 block" />
          <TextInput
            id="judul"
            type="text"
            placeholder="Masukkan judul blog..."
            required
            value={formData.judul}
            onChange={handleChange}
          />
        </div>

        {/* Created At */}
        <div>
          <Label htmlFor="createdAt" value="Created At" className="mb-2 block" />
          <TextInput
            id="createdAt"
            type="date"
            required
            value={formData.createdAt}
            onChange={handleChange}
          />
        </div>

        {/* Updated At */}
        <div>
          <Label htmlFor="updatedAt" value="Updated At" className="mb-2 block" />
          <TextInput
            id="updatedAt"
            type="date"
            required
            value={formData.updatedAt}
            onChange={handleChange}
          />
        </div>

        {/* Isi Blog */}
        <div>
          <Label htmlFor="isiBlog" value="Isi Blog" className="mb-2 block" />
          <Textarea
            id="isiBlog"
            placeholder="Tulis isi blog di sini..."
            required
            rows={8}
            value={formData.isiBlog}
            onChange={handleChange}
          />
        </div>

        {/* Upload Banner */}
        <div>
          <Label htmlFor="banner" value="Upload Banner" className="mb-2 block" />

          {/* Preview Banner */}
          {previewImage ? (
            <img
              src={previewImage}
              alt="Preview Banner"
              className="w-64 h-40 object-cover rounded-lg border mb-3"
            />
          ) : (
            <div className="w-64 h-40 flex items-center justify-center border rounded-lg bg-gray-50 text-gray-400 mb-3">
              Preview Banner
            </div>
          )}

          {/* Input File */}
          <input
            id="banner"
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
          <Button color="error" onClick={() => navigate('/blogs')} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddBlog;
