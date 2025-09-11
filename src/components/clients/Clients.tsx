import { useEffect, useState } from 'react';
import { Dropdown, Table, Button } from 'flowbite-react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

interface Client {
  id: string;
  nama_client: string;
  tanggal_client: string;
  logo_url: string;
  created_at: string;
}

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  const tableActionData = [
    { icon: 'solar:pen-new-square-broken', listtitle: 'Edit', action: 'edit' },
    { icon: 'solar:trash-bin-minimalistic-outline', listtitle: 'Delete', action: 'delete' },
  ];

  // Fetch data
  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('id, nama_client, tanggal_client, logo_url, created_at');

      if (error) throw error;

      if (data) {
        const clientsWithPublicUrl = data.map((item) => {
          const { data: urlData } = supabase.storage
            .from('clients') // pastikan sesuai nama bucket
            .getPublicUrl(item.logo_url);
          return { ...item, logo_url: urlData?.publicUrl || '' };
        });
        setClients(clientsWithPublicUrl as Client[]);
      }
    } catch (err: any) {
      console.error('Error fetching clients:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: string, logoPath: string) => {
    // Konfirmasi SweetAlert
    const result = await Swal.fire({
      title: 'Yakin ingin menghapus data?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      // Hapus dari database
      const { error: deleteError } = await supabase.from('clients').delete().eq('id', id);
      if (deleteError) throw deleteError;

      // Opsional: hapus logo dari storage
      if (logoPath) {
        const { error: storageError } = await supabase.storage.from('client').remove([logoPath]);
        if (storageError) {
          console.warn('Gagal hapus logo dari storage:', storageError.message);
        }
      }

      // Refresh tabel
      setClients((prev) => prev.filter((c) => c.id !== id));

      // Notifikasi sukses
      Swal.fire({
        title: 'Berhasil!',
        text: 'Client berhasil dihapus.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error('Error deleting client:', err.message);
      Swal.fire({
        title: 'Gagal!',
        text: err.message || 'Terjadi kesalahan saat menghapus client.',
        icon: 'error',
      });
    }
  };

  // Handle edit
  const handleEdit = (id: string) => {
    navigate(`/edit/client/${id}`);
  };

  return (
    <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
      <div className="flex items-center justify-between mb-4">
        <h5 className="card-title">Daftar Clients</h5>
        <Button color="primary" onClick={() => navigate('/add/client')}>
          + Tambah Client
        </Button>
      </div>

      <div className="mt-3 overflow-x-auto">
        {loading ? (
          // Skeleton
          <Table>
            <Table.Head>
              <Table.HeadCell className="p-6">Client</Table.HeadCell>
              <Table.HeadCell>Tanggal Menjadi Client</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-border dark:divide-darkborder">
              {[...Array(4)].map((_, index) => (
                <Table.Row key={index}>
                  <Table.Cell className="whitespace-nowrap ps-6">
                    <div className="flex gap-3 items-center">
                      <div className="h-[50px] w-[50px] rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="max-w-56 space-y-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        ) : (
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell className="p-6">Client</Table.HeadCell>
              <Table.HeadCell>Tanggal Menjadi Client</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y divide-border dark:divide-darkborder">
              {clients.length > 0 ? (
                clients.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell className="whitespace-nowrap ps-6">
                      <div className="flex gap-3 items-center">
                        <img
                          src={item.logo_url}
                          alt={item.nama_client}
                          className="h-[50px] w-[50px] rounded-full object-cover border"
                        />
                        <div className="max-w-56">
                          <h6 className="text-sm font-medium">{item.nama_client}</h6>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-sm text-gray-600">{item.tanggal_client}</span>
                    </Table.Cell>
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
                        {tableActionData.map((action, idx) => (
                          <Dropdown.Item
                            key={idx}
                            className="flex gap-3"
                            onClick={() => {
                              if (action.action === 'edit') {
                                handleEdit(item.id);
                              } else if (action.action === 'delete') {
                                handleDelete(item.id, item.logo_url);
                              }
                            }}
                          >
                            <Icon icon={action.icon} height={18} />
                            <span>{action.listtitle}</span>
                          </Dropdown.Item>
                        ))}
                      </Dropdown>
                    </Table.Cell>
                  </Table.Row>
                ))
              ) : (
                <Table.Row>
                  <Table.Cell colSpan={3} className="text-center py-4">
                    Tidak ada data client
                  </Table.Cell>
                </Table.Row>
              )}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
};

export { Clients };
