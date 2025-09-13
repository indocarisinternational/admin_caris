import { useEffect, useState } from 'react';
import { Badge, Dropdown, Table, Button } from 'flowbite-react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

interface Employee {
  id: string;
  full_name: string;
  position: string;
  department: string;
  email_office: string;
  instagram_url?: string;
  profile_photo_url: string; // path di storage
}

const SkeletonRow = () => (
  <Table.Row>
    <Table.Cell>
      <div className="h-6 bg-gray-300 rounded w-48 animate-pulse"></div>
    </Table.Cell>
    <Table.Cell>
      <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
    </Table.Cell>
    <Table.Cell>
      <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
    </Table.Cell>
    <Table.Cell>
      <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
    </Table.Cell>
  </Table.Row>
);

const Pegawai = () => {
  const navigate = useNavigate();
  const [pegawai, setPegawai] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPegawai = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select(
          'id, full_name, position, department, email_office, instagram_url, profile_photo_url',
        )
        .order('full_name', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error fetching employees:', error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal mengambil data',
          text: error.message,
        });
      } else if (data) {
        const updatedData = data.map((item) => {
          const { data: urlData } = supabase.storage
            .from('employees')
            .getPublicUrl(item.profile_photo_url);
          return {
            ...item,
            profile_photo_url: urlData?.publicUrl || '',
          };
        });
        setPegawai(updatedData);
      }
      setLoading(false);
    };

    fetchPegawai();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/edit/pegawai/${id}`);
  };

  const handleDelete = (id: string, imagePath: string) => {
    Swal.fire({
      title: 'Yakin ingin menghapus?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Hapus',
      cancelButtonText: 'Batal',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          Swal.fire({
            title: 'Menghapus data...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
          });

          // Hapus foto di storage
          const { error: storageError } = await supabase.storage
            .from('employees')
            .remove([imagePath]);
          if (storageError) throw new Error(storageError.message);

          // Hapus data di tabel
          const { error: tableError } = await supabase.from('employees').delete().eq('id', id);
          if (tableError) throw new Error(tableError.message);

          setPegawai((prev) => prev.filter((p) => p.id !== id));

          Swal.fire('Dihapus!', 'Data pegawai berhasil dihapus.', 'success');
        } catch (error: any) {
          Swal.fire('Gagal', error.message || 'Terjadi kesalahan', 'error');
        }
      }
    });
  };

  return (
    <div className="rounded-xl shadow-md bg-white dark:bg-darkgray p-6 relative w-full">
      <div className="flex items-center justify-between mb-4">
        <h5 className="card-title">Daftar Pegawai</h5>
        <Button color="primary" onClick={() => navigate('/add/pegawai')}>
          + Tambah Pegawai
        </Button>
      </div>

      <div className="mt-3 overflow-x-auto">
        <Table hoverable>
          <Table.Head>
            <Table.HeadCell className="p-6">Pegawai</Table.HeadCell>
            <Table.HeadCell>Jabatan</Table.HeadCell>
            <Table.HeadCell>Departemen</Table.HeadCell>
            <Table.HeadCell>Email Office</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {loading ? (
              Array(5)
                .fill(null)
                .map((_, i) => <SkeletonRow key={i} />)
            ) : pegawai.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={5} className="text-center py-6 text-gray-500">
                  Data pegawai kosong
                </Table.Cell>
              </Table.Row>
            ) : (
              pegawai.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell className="whitespace-nowrap ps-6">
                    <div className="flex gap-3 items-center">
                      <img
                        src={item.profile_photo_url}
                        alt="pegawai"
                        className="h-[50px] w-[50px] rounded-full object-cover"
                      />
                      <div>
                        <h6 className="text-sm font-semibold">{item.full_name}</h6>
                        {item.instagram_url && (
                          <a
                            href={item.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500"
                          >
                            @
                            {item.instagram_url.replace(
                              /^https?:\/\/(www\.)?instagram_url\.com\//,
                              '',
                            )}
                          </a>
                        )}
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{item.position}</Table.Cell>
                  <Table.Cell>{item.department}</Table.Cell>
                  <Table.Cell>{item.email_office}</Table.Cell>
                  <Table.Cell>
                    <Dropdown
                      label=""
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                          <HiOutlineDotsVertical size={22} />
                        </span>
                      )}
                    >
                      <Dropdown.Item onClick={() => handleEdit(item.id)} className="flex gap-3">
                        <Icon icon="solar:pen-new-square-broken" height={18} />
                        <span>Edit</span>
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() =>
                          handleDelete(
                            item.id,
                            item.profile_photo_url.replace(
                              /^.*\/storage\/v1\/object\/public\/employees\//,
                              '',
                            ),
                          )
                        }
                        className="flex gap-3"
                      >
                        <Icon icon="solar:trash-bin-minimalistic-outline" height={18} />
                        <span>Delete</span>
                      </Dropdown.Item>
                    </Dropdown>
                  </Table.Cell>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
    </div>
  );
};

export { Pegawai };
