import { useState } from 'react';
import { Label, TextInput, Textarea, Button } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

const AddPegawai = () => {
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
    const formValues = {
      employee_code: (document.getElementById('employee_code') as HTMLInputElement)?.value.trim(),
      full_name: (document.getElementById('full_name') as HTMLInputElement)?.value.trim(),
      company_name: (document.getElementById('company_name') as HTMLInputElement)?.value.trim(),
      position: (document.getElementById('position') as HTMLInputElement)?.value.trim(),
      department: (document.getElementById('department') as HTMLInputElement)?.value.trim(),
      nik_internal: (document.getElementById('nik_internal') as HTMLInputElement)?.value.trim(),
      join_date: (document.getElementById('join_date') as HTMLInputElement)?.value,
      job_level: (document.getElementById('job_level') as HTMLInputElement)?.value.trim(),
      specialization: (document.getElementById('specialization') as HTMLInputElement)?.value.trim(),
      work_experience: (
        document.getElementById('work_experience') as HTMLInputElement
      )?.value.trim(),
      education: (document.getElementById('education') as HTMLInputElement)?.value.trim(),
      email_office: (document.getElementById('email_office') as HTMLInputElement)?.value.trim(),
      phone_number: (document.getElementById('phone_number') as HTMLInputElement)?.value.trim(),
      linkedin_url: (document.getElementById('linkedin_url') as HTMLInputElement)?.value.trim(),
      portfolio_url: (document.getElementById('portfolio_url') as HTMLInputElement)?.value.trim(),
      instagram_url: (document.getElementById('instagram_url') as HTMLInputElement)?.value.trim(),
      id_card_number: (document.getElementById('id_card_number') as HTMLInputElement)?.value.trim(),
      id_card_valid_until: (document.getElementById('id_card_valid_until') as HTMLInputElement)
        ?.value,
      blood_type: (document.getElementById('blood_type') as HTMLInputElement)?.value.trim(),
      address: (document.getElementById('address') as HTMLTextAreaElement)?.value.trim(),
      digital_signature_url: (
        document.getElementById('digital_signature_url') as HTMLInputElement
      )?.value.trim(),
      qr_code_url: (document.getElementById('qr_code_url') as HTMLInputElement)?.value.trim(),
      cv_url: (document.getElementById('cv_url') as HTMLInputElement)?.value.trim(),
      badges: (document.getElementById('badges') as HTMLInputElement)?.value
        .split(',')
        .map((b) => b.trim())
        .filter((b) => b !== ''), // biar ga ada string kosong
    };

    if (!formValues.full_name || !formValues.position || !formValues.department) {
      Swal.fire('Warning', 'Field wajib tidak boleh kosong!', 'warning');
      return;
    }

    try {
      setLoading(true);

      let uploadedPath = null;
      if (imageFile) {
        const { data: imgData, error: imgError } = await supabase.storage
          .from('employees')
          .upload(`photos/${Date.now()}_${imageFile.name}`, imageFile);
        if (imgError) throw imgError;
        uploadedPath = imgData?.path;
      }

      const { error: dbError } = await supabase.from('employees').insert([
        {
          ...formValues,
          profile_photo_url: uploadedPath,
        },
      ]);

      if (dbError) throw dbError;

      Swal.fire('Success', 'Data pegawai berhasil ditambahkan!', 'success');
      navigate('/pegawais');
    } catch (err: any) {
      Swal.fire('Error', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <h5 className="card-title">Tambah Pegawai</h5>
      <div className="mt-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Kolom Kiri */}
          <div className="lg:col-span-6 col-span-12 flex flex-col gap-4">
            <div>
              <Label htmlFor="employee_code" value="Employee Code" className="mb-2 block" />
              <TextInput id="employee_code" placeholder="EMP001" />
            </div>

            <div>
              <Label htmlFor="full_name" value="Nama Lengkap" className="mb-2 block" />
              <TextInput id="full_name" placeholder="Nama Lengkap" required />
            </div>

            <div>
              <Label htmlFor="company_name" value="Perusahaan" className="mb-2 block" />
              <TextInput id="company_name" defaultValue="PT. Indo Caris International" />
            </div>

            <div>
              <Label htmlFor="position" value="Jabatan / Position" className="mb-2 block" />
              <TextInput id="position" placeholder="Manager" required />
            </div>

            <div>
              <Label htmlFor="department" value="Departemen" className="mb-2 block" />
              <TextInput id="department" placeholder="Finance" required />
            </div>

            <div>
              <Label htmlFor="nik_internal" value="NIK Internal" className="mb-2 block" />
              <TextInput id="nik_internal" placeholder="123456" />
            </div>

            <div>
              <Label htmlFor="join_date" value="Tanggal Masuk" className="mb-2 block" />
              <TextInput id="join_date" type="date" />
            </div>

            <div>
              <Label htmlFor="job_level" value="Job Level" className="mb-2 block" />
              <TextInput id="job_level" placeholder="Senior" />
            </div>

            <div>
              <Label htmlFor="specialization" value="Spesialisasi" className="mb-2 block" />
              <TextInput id="specialization" placeholder="UI/UX, Backend, dsb" />
            </div>

            <div>
              <Label htmlFor="work_experience" value="Pengalaman Kerja" className="mb-2 block" />
              <TextInput id="work_experience" placeholder="3 Tahun" />
            </div>

            <div>
              <Label htmlFor="education" value="Pendidikan" className="mb-2 block" />
              <TextInput id="education" placeholder="S1 Informatika" />
            </div>

            <div>
              <Label htmlFor="badges" value="Badges" className="mb-2 block" />
              <TextInput id="badges" placeholder="Best Employee, Team Player" />
            </div>

            {/* Upload Foto */}
            <div>
              <Label htmlFor="profilePhoto" value="Upload Foto Pegawai" className="mb-2 block" />
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
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
              />
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="lg:col-span-6 col-span-12 flex flex-col gap-4">
            <div>
              <Label htmlFor="email_office" value="Email Kantor" className="mb-2 block" />
              <TextInput id="email_office" type="email" placeholder="email@company.com" />
            </div>

            <div>
              <Label htmlFor="phone_number" value="Nomor Telepon" className="mb-2 block" />
              <TextInput id="phone_number" placeholder="08123456789" />
            </div>

            <div>
              <Label htmlFor="linkedin_url" value="LinkedIn URL" className="mb-2 block" />
              <TextInput id="linkedin_url" placeholder="https://linkedin.com/in/..." />
            </div>

            <div>
              <Label htmlFor="portfolio_url" value="Portfolio URL" className="mb-2 block" />
              <TextInput id="portfolio_url" placeholder="https://portfolio.com" />
            </div>

            <div>
              <Label htmlFor="instagram_url" value="Instagram URL" className="mb-2 block" />
              <TextInput id="instagram_url" placeholder="https://instagram.com/..." />
            </div>

            <div>
              <Label htmlFor="id_card_number" value="Nomor KTP" className="mb-2 block" />
              <TextInput id="id_card_number" placeholder="1234567890" />
            </div>

            <div>
              <Label
                htmlFor="id_card_valid_until"
                value="KTP Berlaku Hingga"
                className="mb-2 block"
              />
              <TextInput id="id_card_valid_until" type="date" />
            </div>

            <div>
              <Label htmlFor="blood_type" value="Golongan Darah" className="mb-2 block" />
              <TextInput id="blood_type" placeholder="O, A, B, AB" />
            </div>

            <div>
              <Label htmlFor="address" value="Alamat" className="mb-2 block" />
              <Textarea id="address" rows={3} placeholder="Alamat Lengkap" />
            </div>

            <div>
              <Label
                htmlFor="digital_signature_url"
                value="Digital Signature URL"
                className="mb-2 block"
              />
              <TextInput id="digital_signature_url" placeholder="URL tanda tangan digital" />
            </div>

            <div>
              <Label htmlFor="qr_code_url" value="QR Code URL" className="mb-2 block" />
              <TextInput id="qr_code_url" placeholder="URL QR Code" />
            </div>

            <div>
              <Label htmlFor="cv_url" value="CV URL" className="mb-2 block" />
              <TextInput id="cv_url" placeholder="URL CV" />
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="col-span-12 flex gap-3 mt-4">
            <Button type="submit" color="primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Submit'}
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

export default AddPegawai;
