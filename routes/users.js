const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);



/**
 * @swagger
 * /profiles/{id}:
 *   get:
 *     summary: ID'ye göre kullanici getir
 *     tags: [Profiles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Kullanicinin  ID'si
 *     responses:
 *       200:
 *         description: Kullanici bulundu
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Kullanici bulunamadı
 */
router.get('/:id', async (req,res) =>{
    const {id} = req.params;
    const {data,error} = await supabase
    .from('profiles').select('*').eq('id',id).single();
     if (error || !data) return res.status(404).json({ error: 'Kullanici bulunamadı' });
  res.json(data);
})

module.exports = router;
