import { useEffect, useState } from 'react';
import { Badge } from 'flowbite-react';
import { TbPoint } from 'react-icons/tb';
import { Icon } from '@iconify/react';
import { Link } from 'react-router';
import { supabase } from '../../lib/supabaseClient';
import Swal from 'sweetalert2';

interface Blog {
  id: string;
  judul: string;
  created_at: string;
  isi: string;
  banner_url: string;
}

const BlogCards = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, judul, created_at, isi, banner_url')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        Swal.fire('Error', error.message, 'error');
        setLoading(false);
        return;
      }

      // mapping supaya banner_url jadi public URL
      const mapped = data.map((item: any) => {
        const { data: urlData } = supabase.storage.from('blogs').getPublicUrl(item.banner_url);

        return {
          ...item,
          banner_url: urlData?.publicUrl || '/placeholder.png',
        };
      });

      setBlogs(mapped);
      setLoading(false);
    };

    fetchBlogs();
  }, []);

  return (
    <div className="grid grid-cols-12 gap-6">
      {loading ? (
        <p className="col-span-12 text-center">Loading...</p>
      ) : blogs.length === 0 ? (
        <p className="col-span-12 text-center">Belum ada blog</p>
      ) : (
        blogs.map((item) => (
          <div className="lg:col-span-4 col-span-12" key={item.id}>
            <Link to={`/blog/${item.id}`} className="group">
              <div className="rounded-xl dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray overflow-hidden">
                {/* Banner */}
                <div className="relative">
                  <img
                    src={item.banner_url}
                    alt={item.judul}
                    className="w-full h-[200px] object-cover"
                  />
                  <Badge
                    color={'muted'}
                    className="absolute bottom-3 right-3 font-semibold rounded-sm bg-muted"
                  >
                    {new Date(item.created_at).toDateString()}
                  </Badge>
                </div>

                {/* Content */}
                <div className="px-6 pb-6">
                  <h5 className="text-lg my-4 group-hover:text-primary line-clamp-2">
                    {item.judul}
                  </h5>
                  <p className="text-sm text-gray-600 line-clamp-3">{item.isi}</p>

                  <div className="flex gap-1 items-center mt-4 text-sm text-darklink">
                    <TbPoint size={15} className="text-dark" />
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default BlogCards;
