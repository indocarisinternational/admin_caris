import { useState, useEffect } from 'react';
import { Label, TextInput, Textarea, Button } from 'flowbite-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

const EditBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    judul: '',
    createdAt: '',
    updatedAt: '',
    isiBlog: '',
    banner_url: '',
  });
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true); // untuk skeleton

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();

        if (error) {
          Swal.fire({ icon: 'error', title: 'Gagal mengambil data', text: error.message });
          return;
        }

        setFormData({
          judul: data.judul,
          createdAt: data.created_at ? data.created_at.split('T')[0] : '',
          updatedAt: data.updated_at ? data.updated_at.split('T')[0] : '',
          isiBlog: data.isi,
          banner_url: data.banner_url,
        });

        if (data.banner_url) {
          const { data: publicUrl } = supabase.storage.from('blogs').getPublicUrl(data.banner_url);
          setPreviewImage(publicUrl.publicUrl);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchBlog();
  }, [id]);

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
        Swal.fire({ icon: 'warning', title: 'Lengkapi semua data' });
        return;
      }

      setLoading(true);
      let bannerPath = formData.banner_url;

      if (bannerFile) {
        const filePath = `banners/${Date.now()}_${bannerFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blogs')
          .upload(filePath, bannerFile, { upsert: true });

        if (uploadError) throw uploadError;
        bannerPath = uploadData?.path || bannerPath;
      }

      const { error: updateError } = await supabase
        .from('blogs')
        .update({
          judul: formData.judul,
          created_at: formData.createdAt,
          updated_at: formData.updatedAt,
          isi: formData.isiBlog,
          banner_url: bannerPath,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Blog berhasil diperbarui.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/blogs');
    } catch (err: any) {
      Swal.fire({ icon: 'error', title: 'Gagal mengupdate blog', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    // SKELETON LOADING
    return (
      <div className="rounded-xl shadow-md bg-white dark:bg-darkgray p-6 w-full animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>
        <div className="flex flex-col gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-10 bg-gray-300 rounded w-full"></div>
            </div>
          ))}
          <div>
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="w-64 h-40 bg-gray-300 rounded-lg"></div>
          </div>
          <div className="flex gap-3 mt-4">
            <div className="h-10 w-24 bg-gray-300 rounded"></div>
            <div className="h-10 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 w-full">
      <h5 className="card-title">Edit Blog</h5>

      <div className="mt-6 flex flex-col gap-4">
        <div>
          <Label htmlFor="judul" value="Judul Blog" />
          <TextInput id="judul" value={formData.judul} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="createdAt" value="Created At" />
          <TextInput
            id="createdAt"
            type="date"
            value={formData.createdAt}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="updatedAt" value="Updated At" />
          <TextInput
            id="updatedAt"
            type="date"
            value={formData.updatedAt}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="isiBlog" value="Isi Blog" />
          <Textarea id="isiBlog" rows={8} value={formData.isiBlog} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="banner" value="Upload Banner" />
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
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <div className="flex gap-3 mt-4">
          <Button color="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Update'}
          </Button>
          <Button color="error" onClick={() => navigate('/blogs')} disabled={loading}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditBlog;
