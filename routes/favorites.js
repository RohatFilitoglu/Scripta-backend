const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");


const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Favori işlemleri
 */

/**
 * @swagger
 * /favorites/{userId}:
 *   get:
 *     summary: Kullanıcının favori postlarını getirir
 *     tags: [Favorites]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Favorileri alınacak kullanıcının ID'si
 *     responses:
 *       200:
 *         description: Favoriler başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */

/**
 * @swagger
 * /favorites:
 *   post:
 *     summary: Yeni favori ekler
 *     tags: [Favorites]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - postId
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "e1b23dd7-19c4-45a0-bfe7-xyz987654321"
 *               postId:
 *                 type: string
 *                 example: "e5e2892d-7f3a-4a12-a4d7-abc123456789"
 *     responses:
 *       201:
 *         description: Favori başarıyla eklendi
 *       400:
 *         description: Hatalı istek
 */

/**
 * @swagger
 * /favorites:
 *   delete:
 *     summary: userId ve postId ile favoriyi kaldırır
 *     tags: [Favorites]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Favori başarıyla silindi
 *       400:
 *         description: Hatalı istek
 */


// Kullanıcının favori postlarını getir
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from("favorites")
      .select("*, post:posts(*)")  
    .eq("userId", userId);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

// Yeni favori ekle
router.post("/", async (req, res) => {
  const { userId, postId } = req.body;

  if (!userId || !postId) {
    return res.status(400).json({ error: "userId ve postId gereklidir." });
  }

  // Daha önce eklenmiş mi?
  const { data: existing, error: checkError } = await supabase
    .from("favorites")
    .select("*")
    .eq("userId", userId)
    .eq("postId", postId)
    .maybeSingle();

  if (checkError) return res.status(400).json({ error: checkError.message });

  if (existing) {
    return res
      .status(200)
      .json({ message: "Zaten favorilere eklenmiş.", data: existing });
  }

  // Yeni favori ekle
  const { data, error } = await supabase
    .from("favorites")
    .insert([{ userId, postId }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
});

// Favoriden kaldır
// userId ve postId ile favoriyi sil
router.delete("/", async (req, res) => {
  const { userId, postId } = req.query;

  if (!userId || !postId) {
    return res.status(400).json({ error: "userId ve postId gereklidir." });
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("userId", userId)
    .eq("postId", postId);

  if (error) return res.status(400).json({ error: error.message });

  res.status(204).send();
});


module.exports = router;
