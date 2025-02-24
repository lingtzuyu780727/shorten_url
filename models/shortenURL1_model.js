const pool = require('./mysqlconf');
const rand = require('random-key');

const addShortUrl = async (longUrl) => {
  const getRandom = rand.generate(6);
  // 組成七碼隨機 url
  const shortUrl = process.env.EC2_NUM + getRandom;
  const conn = await pool.getConnection();
  try {
    await conn.query('START TRANSACTION');
    let [resCheckShortUrl] = await conn.query(
      'SELECT * FROM url_info WHERE short_url = ? FOR UPDATE',
      [shortUrl]
    );
    while (resCheckShortUrl.length !== 0) {
      // 有重複的 shortUrl
      const getRandom = rand.generate(6);
      // 組成七碼隨機 url
      const shortUrl = process.env.EC2_NUM + getRandom;
      [resCheckShortUrl] = await conn.query(
        'SELECT * FROM url_info WHERE short_url = ? FOR UPDATE',
        [shortUrl]
      );
    }
    const [result] = await conn.query(
      'INSERT INTO `url_info` (short_url, long_url) VALUES (?,?)',
      [shortUrl, longUrl]
    );
    console.log(result);
    await conn.query('COMMIT');
  } catch (error) {
    await conn.query('ROLLBACK');
    return { error };
  } finally {
    conn.release();
  }
};

module.exports = { addShortUrl };
