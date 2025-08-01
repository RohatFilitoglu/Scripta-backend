const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: Yorum işlemleri
 */

/**
 * @swagger
 * /comments/{postId}:
 *   get:
 *     summary: Belirli bir posta ait yorumları getir
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *         description: Yorumların getirileceği postun ID'si
 *     responses:
 *       200:
 *         description: Yorumlar başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Yeni yorum ekler
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - postid
 *               - userid
 *               - content
 *               - author
 *               - date
 *             properties:
 *               postid:
 *                 type: string
 *                 example: "e5e2892d-7f3a-4a12-a4d7-abc123456789"
 *               userid:
 *                 type: string
 *                 example: "e1b23dd7-19c4-45a0-bfe7-xyz987654321"
 *               content:
 *                 type: string
 *                 example: "Bu yazıya bayıldım!"
 *               author:
 *                 type: string
 *                 example: "Rohat"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-07-21"
 *     responses:
 *       201:
 *         description: Yorum başarıyla oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Hatalı istek
 */



/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Yorumu sil
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Silinecek yorumun ID'si
 *     responses:
 *       204:
 *         description: Yorum başarıyla silindi
 *       400:
 *         description: Hatalı istek
 */

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Yorumu güncelle
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Güncellenecek yorumun ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - author
 *             properties:
 *               content:
 *                 type: string
 *                 example: "Yorumumu güncelledim!"
 *               author:
 *                 type: string
 *                 example: "Rohat"
 *     responses:
 *       200:
 *         description: Yorum başarıyla güncellendi
 *       400:
 *         description: Hatalı istek
 */

// Belirli bir posta ait yorumları getir

router.get('/:postId', async (req, res) => {
  const { postId } = req.params;
  const { data, error } = await supabase.from('comments').select('*').eq('postid', postId);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});


router.post('/', async (req, res) => {
  const { postid, userid, content, author, date } = req.body;

  // Validation
  if (!postid || !userid || !content || !author || !date) {
    return res.status(400).json({ error: "Gerekli alanlar eksik." });
  }

  const { error: insertError } = await supabase
    .from('comments')
    .insert([{ postid, userid, content, author, date }]);

  if (insertError) {
    return res.status(400).json({ error: insertError.message });
  }

  // Son eklenen veriyi postid ve userid ile al
  const { data, error: selectError } = await supabase
    .from('comments')
    .select('*')
    .eq('postid', postid)
    .eq('userid', userid)
    .order('created_at', { ascending: false })
    .limit(1);

  if (selectError || !data || data.length === 0) {
    return res.status(500).json({ error: "Yorum eklendi ama veri alınamadı." });
  }

  res.status(201).json(data[0]);
});



// Yorumu sil
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('comments').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.status(204).send();
});

// Yorumu güncelle
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { content, author } = req.body;
  const { data, error } = await supabase.from('comments').update({ content, author }).eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

module.exports = router;
