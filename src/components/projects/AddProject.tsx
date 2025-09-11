import { useState } from 'react';
import { Label, TextInput, Select, Textarea, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

const AddProject = () => {
  const navigate = useNavigate();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setImageFile(file);
    }
  };

  const handleSubmit = async () => {
    // Validasi sederhana sebelum lanjut
    const projectName = (document.getElementById('projectName') as HTMLInputElement)?.value.trim();
    const client = (document.getElementById('client') as HTMLInputElement)?.value.trim();
    const jenisProject = (document.getElementById('jenisProject') as HTMLSelectElement)?.value;
    const jumlahFitur = (document.getElementById('jumlahFitur') as HTMLInputElement)?.value;
    const createdAt = (document.getElementById('createdAt') as HTMLInputElement)?.value;
    const deadline = (document.getElementById('deadline') as HTMLInputElement)?.value;
    const totalFitur = (document.getElementById('fitur') as HTMLInputElement)?.value;
    const status = (document.getElementById('status') as HTMLSelectElement)?.value;
    const deskripsi = (document.getElementById('deskripsi') as HTMLTextAreaElement)?.value.trim();

    if (
      !projectName ||
      !client ||
      !jenisProject ||
      !jumlahFitur ||
      !createdAt ||
      !deadline ||
      !totalFitur ||
      !status ||
      !deskripsi
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Isi semua field!',
        text: 'Mohon lengkapi semua data project terlebih dahulu.',
      });
      return;
    }

    if (!imageFile) {
      Swal.fire({
        icon: 'warning',
        title: 'Belum ada gambar!',
        text: 'Mohon pilih gambar project terlebih dahulu.',
      });
      return;
    }

    try {
      setLoading(true);

      // Upload image ke Supabase Storage
      const { data: imgData, error: imgError } = await supabase.storage
        .from('projects')
        .upload(`images/${Date.now()}_${imageFile.name}`, imageFile);

      if (imgError) throw imgError;

      // Insert data ke table
      const { error: dbError } = await supabase.from('projects').insert([
        {
          project_name: projectName,
          client: client,
          jenis_project: jenisProject,
          jumlah_fitur: Number(jumlahFitur),
          created_at: createdAt,
          deadline: deadline,
          total_fitur: Number(totalFitur),
          status: status,
          deskripsi: deskripsi,
          image_url: imgData?.path,
        },
      ]);

      if (dbError) throw dbError;

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Project berhasil ditambahkan.',
        timer: 2000,
        showConfirmButton: false,
      });

      navigate('/projects');
    } catch (err: any) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: `Gagal menambahkan project: ${err.message}`,
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Tambah Project</h5>
      <div className="mt-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Kolom Kiri */}
          <div className="lg:col-span-6 col-span-12">
            <div className="flex flex-col gap-4">
              {/* Nama Project */}
              <div>
                <Label htmlFor="projectName" value="Nama Project" className="mb-2 block" />
                <TextInput id="projectName" type="text" placeholder="E-Commerce Web App" required />
              </div>

              {/* Client */}
              <div>
                <Label htmlFor="client" value="Client" className="mb-2 block" />
                <TextInput id="client" type="text" placeholder="BizUp.id" required />
              </div>

              {/* Jenis Project */}
              <div>
                <Label htmlFor="jenisProject" value="Jenis Project" className="mb-2 block" />
                <Select id="jenisProject" required>
                  <option value="">Pilih jenis</option>
                  <option value="web">Web</option>
                  <option value="mobile">Mobile</option>
                  <option value="desktop">Desktop</option>
                </Select>
              </div>

              {/* Jumlah Fitur */}
              <div>
                <Label htmlFor="jumlahFitur" value="Jumlah Fitur" className="mb-2 block" />
                <TextInput id="jumlahFitur" type="number" placeholder="Misal: 12" required />
              </div>

              {/* Upload Gambar */}
              <div>
                <Label
                  htmlFor="projectImage"
                  value="Upload Gambar Project"
                  className="mb-2 block"
                />
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border mb-3"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center border rounded-lg bg-gray-50 text-gray-400 mb-3">
                    Preview
                  </div>
                )}
                <input
                  id="projectImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="lg:col-span-6 col-span-12">
            <div className="flex flex-col gap-4">
              {/* Tanggal Dibuat */}
              <div>
                <Label htmlFor="createdAt" value="Tanggal Dibuat" className="mb-2 block" />
                <TextInput id="createdAt" type="date" required />
              </div>

              {/* Deadline */}
              <div>
                <Label htmlFor="deadline" value="Deadline" className="mb-2 block" />
                <TextInput id="deadline" type="date" required />
              </div>

              {/* Fitur */}
              <div>
                <Label htmlFor="fitur" value="Total Fitur" className="mb-2 block" />
                <TextInput id="fitur" type="number" placeholder="Misal: 5000" required />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status" value="Status" className="mb-2 block" />
                <Select id="status" required>
                  <option value="">Pilih status</option>
                  <option value="pending">Pending</option>
                  <option value="inprogress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Select>
              </div>

              {/* Deskripsi Project */}
              <div>
                <Label htmlFor="deskripsi" value="Deskripsi Project" className="mb-2 block" />
                <Textarea
                  id="deskripsi"
                  placeholder="Tuliskan deskripsi singkat project..."
                  required
                  rows={8}
                />
              </div>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="col-span-12 flex gap-3 mt-4">
            <Button type="submit" color="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Submit'}
            </Button>
            <Button color="error" onClick={() => navigate('/projects')} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProject;
