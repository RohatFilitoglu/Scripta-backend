const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require("uuid"); // en üste ekle

const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET_NAME = 'post-images';

const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post işlemleri
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Tüm postları getir
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: Post listesi başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Başlığa göre post arama
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Aranacak post başlığı
 *     responses:
 *       200:
 *         description: Eşleşen postlar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   author_id:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   image:
 *                     type: string
 *       400:
 *         description: Arama sorgusu boş olamaz
 *       500:
 *         description: Sunucu hatası
 */

router.get('/search', async (req, res) => {
  const {query} = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Arama sorgusu boş olamaz.' });
  }

  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).ilike('title', `%${query}%`);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: ID'ye göre post getir
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Postun ID'si
 *     responses:
 *       200:
 *         description: Post bulundu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Post bulunamadı
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('posts').select('*').eq('id', id).single();
  if (error || !data) return res.status(404).json({ error: 'Post bulunamadı' });
  res.json(data);
});

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Yeni post oluştur (resim dosyası ile)
 *     tags: [Posts]
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - author
 *               - title
 *               - userId
 *             properties:
 *               author:
 *                 type: string
 *                 example: "Rohat"
 *               title:
 *                 type: string
 *                 example: "Supabase Nedir?"
 *               userId:
 *                 type: string
 *                 example: "user-123"
 *               excerpt:
 *                 type: string
 *                 example: "Supabase hakkında temel bilgiler."
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-14"
 *               likes:
 *                 type: integer
 *                 example: 0
 *               category:
 *                 type: string
 *                 example: "Veritabanı"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Yüklenecek görsel dosyası (PNG, JPG, vs.)
 *     responses:
 *       201:
 *         description: Post başarıyla oluşturuldu
 *       400:
 *         description: Hatalı istek veya yükleme hatası
 *       500:
 *         description: Sunucu hatası
*/

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { author, title, userId, excerpt, date, likes, category } = req.body;
    let imageUrl = ''; // eger gorsel yuklenirse bu degisken , dosyanin Supabase uzerindeki yolu ile doldurulacaktir.
const { v4: uuidv4 } = require("uuid"); // en üste ekle

// Benzersiz dosya ismi üret
const timestamp = Date.now(); // milisaniye cinsinden zaman
const extension = req.file.originalname.split('.').pop(); // dosya uzantısını al (jpg, png vs)
const uniqueImageName = `${timestamp}-${uuidv4()}.${extension}`;

// 1. Görsel dosyası varsa yükle
if (req.file) {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(uniqueImageName, req.file.buffer, {
      cacheControl: '3600',
      upsert: false, // Aynı isimde varsa hata versin (güvenli yaklaşım)
    });

  if (error) {
    console.error('Supabase Upload Error:', error);
    return res.status(400).json({ error: error.message });
  }

  imageUrl = data.path;
}

    // 2. Veritabanına post ekle
    const { data, error } = await supabase
      .from('posts')
      .insert([{
        author,
        title,
        userId,
        excerpt,
        date,
        likes: 0,
        category,
        image: imageUrl
      }])
      .select();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data[0]);

  } catch (err) {
    console.error('Genel Sunucu Hatası:', err);
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
});



/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Postu ve ilişkili görseli sil
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Silinecek postun ID'si
 *     responses:
 *       204:
 *         description: Post ve görsel başarıyla silindi
 *       400:
 *         description: Hatalı istek veya post bulunamadı
 *       500:
 *         description: Sunucu hatası
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Silinecek postun görsel yolunu veritabanından al
    const { data: post, error: fetchError } = await supabase
      .from('posts')
      .select('image')
      .eq('id', id) // id sutununda o silinecek olan id ile eslesen 
      .single(); // sorgudan sadece bir tane sonuc beklendigini ifade etmek icin kullanilir

    if (fetchError) {
      return res.status(400).json({ error: fetchError.message });
    }

    // 2. Eğer görsel varsa Supabase Storage'dan sil
    if (post?.image) {
      const { error: deleteImageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([post.image]);

      if (deleteImageError) {
        console.error("Storage'dan görsel silinemedi:", deleteImageError);
        // İstersen burada hata dönebilirsin veya loglayıp devam edebilirsin
      }
    }

    // 3. Postu veritabanından sil
    const { error: deletePostError } = await supabase
      .from('posts')
      .delete()
      .eq('id', id);

    if (deletePostError) {
      return res.status(400).json({ error: deletePostError.message });
    }

    res.status(204).send();

  } catch (err) {
    console.error('Sunucu hatası:', err);
    res.status(500).json({ error: 'Bir hata oluştu.' });
  }
});


/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Postu güncelle
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Güncellenecek postun ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               author:
 *                 type: string
 *                 example: "Rohat Güncellenmiş"
 *               title:
 *                 type: string
 *                 example: "Supabase Rehberi"
 *               userId:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               date:
 *                 type: string
 *               likes:
 *                 type: integer
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post başarıyla güncellendi
 *       400:
 *         description: Hatalı istek
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { author, title, userId, excerpt, date, likes, image, category } = req.body;
  const { data, error } = await supabase.from('posts').update({ author, title, userId, excerpt, date, likes, image, category }).eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

/**
 * @swagger
 * /posts/user/{userId}:
 *   get:
 *     summary: Belirli kullanıcıya ait postları getir
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanıcının ID'si
 *     responses:
 *       200:
 *         description: Postlar getirildi
 */
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('userId', userId)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});


module.exports = router;
