export default class AboutPresenter {
  getTemplate() {
    return `
        <style>
          .about-container {
            max-width: 800px;
            background-color: white;
            margin: 60px auto;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
            animation: fadeIn 0.5s ease-in-out;
          }
  
          .about-container h1 {
            font-size: 2rem;
            color: #333;
            margin-bottom: 24px;
            text-align: center;
          }
  
          .about-container p {
            font-size: 1.1rem;
            line-height: 1.6;
            color: #555;
            margin-bottom: 16px;
            text-align: justify;
          }
  
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        </style>
  
        <section class="about-container">
          <h1>About Me</h1>
          <p>Halo! Saya seorang <strong>IT Support</strong> yang saat ini bekerja di sebuah perusahaan di Jakarta. Dalam pekerjaan saya, saya menangani berbagai masalah teknis dan mendukung kebutuhan teknologi harian perusahaan.</p>
          <p>Saat ini, saya juga sedang <strong>belajar ngoding di Dicoding</strong> untuk memperluas pengetahuan dan keterampilan saya di bidang pengembangan perangkat lunak. Saya percaya bahwa belajar adalah proses yang berkelanjutan dan penuh tantangan.</p>
        </section>
      `;
  }

  afterRender() {}
}
