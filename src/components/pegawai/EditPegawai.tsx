import { useState, useEffect } from 'react';
import { Label, TextInput, Textarea, Button } from 'flowbite-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

const EditPegawai = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ambil id pegawai dari route
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [formValues, setFormValues] = useState<any>({});

  // ambil data pegawai berdasarkan ID
  useEffect(() => {
    const fetchPegawai = async () => {
      const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
      if (error) {
        Swal.fire('Error', error.message, 'error');
        return;
      }
      setFormValues(data);

      if (data.profile_photo_url) {
        const { data: publicUrl } = supabase.storage
          .from('employees')
          .getPublicUrl(data.profile_photo_url);

        setPreviewImage(publicUrl.publicUrl);
      }
    };
    fetchPegawai();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues({
      ...formValues,
      [e.target.id]: e.target.value,
    });
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
    if (!formValues.full_name || !formValues.position || !formValues.department) {
      Swal.fire('Warning', 'Field wajib tidak boleh kosong!', 'warning');
      return;
    }

    try {
      setLoading(true);

      let uploadedPath = formValues.profile_photo_url;
      if (imageFile) {
        const { data: imgData, error: imgError } = await supabase.storage
          .from('employees')
          .upload(`photos/${Date.now()}_${imageFile.name}`, imageFile, { upsert: true });
        if (imgError) throw imgError;
        uploadedPath = imgData?.path;
      }

      const { error: dbError } = await supabase
        .from('employees')
        .update({
          ...formValues,
          profile_photo_url: uploadedPath,
        })
        .eq('id', id);

      if (dbError) throw dbError;

      Swal.fire('Success', 'Data pegawai berhasil diperbarui!', 'success');
      navigate('/pegawais');
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Edit Pegawai</h5>
      <div className="mt-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Kolom Kiri */}
          <div className="lg:col-span-6 col-span-12 flex flex-col gap-4">
            <div>
              <Label htmlFor="employee_code" value="Employee Code" />
              <TextInput
                id="employee_code"
                value={formValues.employee_code || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="full_name" value="Nama Lengkap" />
              <TextInput
                id="full_name"
                value={formValues.full_name || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="company_name" value="Perusahaan" />
              <TextInput
                id="company_name"
                value={formValues.company_name || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="position" value="Jabatan / Position" />
              <TextInput
                id="position"
                value={formValues.position || ''}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="department" value="Departemen" />
              <TextInput
                id="department"
                value={formValues.department || ''}
                onChange={handleChange}
                required
              />
            </div>

            {/* Upload Foto */}
            <div>
              <Label htmlFor="profilePhoto" value="Foto Pegawai" />
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
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm border rounded-lg"
              />
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="lg:col-span-6 col-span-12 flex flex-col gap-4">
            <div>
              <Label htmlFor="email_office" value="Email Kantor" />
              <TextInput
                id="email_office"
                value={formValues.email_office || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="phone_number" value="Nomor Telepon" />
              <TextInput
                id="phone_number"
                value={formValues.phone_number || ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <Label htmlFor="address" value="Alamat" />
              <Textarea
                id="address"
                rows={3}
                value={formValues.address || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="col-span-12 flex gap-3 mt-4">
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Update'}
            </Button>
            <Button color="error" onClick={() => navigate('/pegawais')} disabled={loading}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPegawai;
