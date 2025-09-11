import { useState, useEffect } from 'react';
import { Label, TextInput, Select, Textarea, Button } from 'flowbite-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

const SkeletonInput = () => (
  <div className="mb-4">
    <div className="h-6 bg-gray-300 rounded animate-pulse mb-1 w-40"></div>
    <div className="h-10 bg-gray-300 rounded animate-pulse"></div>
  </div>
);

const EditProject = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ID dari URL /edit/project/:id

  const [formData, setFormData] = useState({
    project_name: '',
    client: '',
    jenis_project: '',
    jumlah_fitur: 0,
    created_at: '',
    deadline: '',
    total_fitur: 0,
    status: '',
    deskripsi: '',
    image_url: '',
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(true);

  // Ambil data project saat pertama kali load
  useEffect(() => {
    const fetchProject = async () => {
      setLoadingFetch(true);
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();

      if (error) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal mengambil data',
          text: error.message,
        });
        setLoadingFetch(false);
        return;
      }

      setFormData(data);
      if (data.image_url) {
        const { data: publicUrlData } = supabase.storage
          .from('projects')
          .getPublicUrl(data.image_url);
        setPreviewImage(publicUrlData.publicUrl);
      }
      setLoadingFetch(false);
    };

    fetchProject();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.id]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      let imagePath = formData.image_url;

      if (imageFile) {
        const { data: imgData, error: imgError } = await supabase.storage
          .from('projects')
          .upload(`images/${Date.now()}_${imageFile.name}`, imageFile, { upsert: true });

        if (imgError) {
          Swal.fire({
            icon: 'error',
            title: 'Gagal upload gambar',
            text: imgError.message,
          });
          setLoading(false);
          return;
        }
        imagePath = imgData?.path || imagePath;
      }

      const { error: dbError } = await supabase
        .from('projects')
        .update({
          project_name: formData.project_name,
          client: formData.client,
          jenis_project: formData.jenis_project,
          jumlah_fitur: Number(formData.jumlah_fitur),
          created_at: formData.created_at,
          deadline: formData.deadline,
          total_fitur: Number(formData.total_fitur),
          status: formData.status,
          deskripsi: formData.deskripsi,
          ...(imagePath && { image_url: imagePath }),
        })
        .eq('id', id);

      if (dbError) {
        Swal.fire({
          icon: 'error',
          title: 'Gagal update project',
          text: dbError.message,
        });
        setLoading(false);
        return;
      }

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Project berhasil diperbarui.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/projects');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Error saat update',
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingFetch) {
    // Skeleton loading form
    return (
      <div className="p-6 bg-white rounded-xl shadow-md">
        <h5 className="mb-6 bg-gray-300 h-8 w-40 rounded animate-pulse"></h5>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-6">
            <SkeletonInput />
            <SkeletonInput />
            <SkeletonInput />
            <SkeletonInput />
            <SkeletonInput />
          </div>
          <div className="col-span-6">
            <SkeletonInput />
            <SkeletonInput />
            <SkeletonInput />
            <SkeletonInput />
            <SkeletonInput />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <h5>Edit Project</h5>
      <div className="grid grid-cols-12 gap-6 mt-6">
        {/* Kolom kiri */}
        <div className="col-span-6">
          <Label htmlFor="project_name" value="Nama Project" />
          <TextInput id="project_name" value={formData.project_name} onChange={handleChange} />

          <Label htmlFor="client" value="Client" className="mt-4" />
          <TextInput id="client" value={formData.client} onChange={handleChange} />

          <Label htmlFor="jenis_project" value="Jenis Project" className="mt-4" />
          <Select id="jenis_project" value={formData.jenis_project} onChange={handleChange}>
            <option value="">Pilih jenis</option>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
            <option value="desktop">Desktop</option>
          </Select>

          <Label htmlFor="jumlah_fitur" value="Jumlah Fitur" className="mt-4" />
          <TextInput
            id="jumlah_fitur"
            type="number"
            value={formData.jumlah_fitur}
            onChange={handleChange}
          />

          <Label htmlFor="projectImage" value="Upload Gambar" className="mt-4" />
          {previewImage && (
            <img src={previewImage} alt="Preview" className="w-32 h-32 object-cover mb-3" />
          )}
          <input type="file" id="projectImage" accept="image/*" onChange={handleImageChange} />
        </div>

        {/* Kolom kanan */}
        <div className="col-span-6">
          <Label htmlFor="created_at" value="Tanggal Dibuat" />
          <TextInput
            id="created_at"
            type="date"
            value={formData.created_at}
            onChange={handleChange}
          />

          <Label htmlFor="deadline" value="Deadline" className="mt-4" />
          <TextInput id="deadline" type="date" value={formData.deadline} onChange={handleChange} />

          <Label htmlFor="total_fitur" value="Total Fitur" className="mt-4" />
          <TextInput
            id="total_fitur"
            type="number"
            value={formData.total_fitur}
            onChange={handleChange}
          />

          <Label htmlFor="status" value="Status" className="mt-4" />
          <Select id="status" value={formData.status} onChange={handleChange}>
            <option value="">Pilih status</option>
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>

          <Label htmlFor="deskripsi" value="Deskripsi" className="mt-4" />
          <Textarea id="deskripsi" rows={5} value={formData.deskripsi} onChange={handleChange} />
        </div>

        {/* Tombol */}
        <div className="col-span-12 mt-4 flex gap-3">
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
          <Button color="gray" onClick={() => navigate('/projects')} disabled={loading}>
            Batal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProject;
