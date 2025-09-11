import { useEffect, useState } from 'react';
import { Dropdown, Table, Button } from 'flowbite-react';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

interface Blog {
  id: string;
  judul: string;
  created_at: string;
  banner_url: string; // Menggunakan banner_url dari database
  updated_at: string;
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
      <div className="h-6 bg-gray-300 rounded w-20 animate-pulse"></div>
    </Table.Cell>
    <Table.Cell>
      <div className="h-6 bg-gray-300 rounded w-10 animate-pulse"></div>
    </Table.Cell>
  </Table.Row>
);

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('id, judul, created_at, banner_url') // Mengambil banner_url dari database
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;

        if (!data) {
          setBlogs([]);
          setLoading(false);
          return;
        }

        // Mendapatkan URL publik untuk gambar dari bucket 'blogs'
        const blogsWithUrls = await Promise.all(
          data.map(async (item) => {
            const { data: urlData } = supabase.storage.from('blogs').getPublicUrl(item.banner_url);
            return {
              ...item,
              banner_url: urlData?.publicUrl || '', // Menggunakan URL publik
              updated_at: new Date().toISOString(),
            };
          }),
        );

        setBlogs(blogsWithUrls);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: error instanceof Error ? error.message : 'Failed to fetch blogs',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleEdit = (id: string) => {
    navigate(`/edit/blog/${id}`);
  };

  const handleDelete = async (id: string) => {
    const confirmation = await Swal.fire({
      title: 'Konfirmasi Hapus',
      text: 'Anda yakin ingin menghapus blog ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
    });

    if (confirmation.isConfirmed) {
      try {
        // Delete record from database
        const { error: dbError } = await supabase.from('blogs').delete().eq('id', id);

        if (dbError) throw dbError;

        // Update UI
        setBlogs(blogs.filter((blog) => blog.id !== id));

        Swal.fire('Deleted!', 'Blog berhasil dihapus.', 'success');
      } catch (error) {
        Swal.fire(
          'Error!',
          error instanceof Error ? error.message : 'Gagal menghapus blog',
          'error',
        );
      }
    }
  };

  return (
    <div className="rounded-xl shadow-md bg-white dark:bg-gray-800 p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Daftar Blog</h2>
        <Button color="blue" onClick={() => navigate('/add/blog')}>
          <Icon icon="material-symbols:add" className="mr-2" />
          Tambah Blog
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table hoverable className="w-full">
          <Table.Head>
            <Table.HeadCell>Judul Blog</Table.HeadCell>
            <Table.HeadCell>Tanggal Dibuat</Table.HeadCell>
            <Table.HeadCell>Terakhir Diupdate</Table.HeadCell>
            <Table.HeadCell></Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {loading ? (
              Array(5)
                .fill(0)
                .map((_, i) => <SkeletonRow key={i} />)
            ) : blogs.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={4} className="text-center py-8">
                  <p className="text-gray-500">Tidak ada data blog</p>
                </Table.Cell>
              </Table.Row>
            ) : (
              blogs.map((blog) => (
                <Table.Row key={blog.id}>
                  <Table.Cell className="whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <img
                        src={blog.banner_url} // Menggunakan banner_url yang sudah diperoleh
                        alt={`Banner untuk ${blog.judul}`}
                        className="w-20 h-12 rounded-md object-cover"
                      />
                      <span className="font-medium">{blog.judul}</span>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{new Date(blog.created_at).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>{new Date(blog.updated_at).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <Dropdown
                      label=""
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                          <HiOutlineDotsVertical size={20} />
                        </button>
                      )}
                    >
                      <Dropdown.Item
                        onClick={() => handleEdit(blog.id)}
                        className="flex items-center gap-2"
                      >
                        <Icon icon="solar:pen-new-square-broken" height={18} />
                        Edit
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleDelete(blog.id)}
                        className="flex items-center gap-2 text-red-600"
                      >
                        <Icon icon="solar:trash-bin-minimalistic-outline" height={18} />
                        Hapus
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

export { Blogs };
