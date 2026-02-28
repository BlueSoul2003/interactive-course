// ==========================================
// DATABASE MASSIVE SPM IMBAKUP WITH TRANSLATIONS
// ==========================================
const db = [
    {
        theme: { ms: "TEMA 1: KELUARGA & MASYARAKAT", en: "THEME 1: FAMILY & SOCIETY", zh: "主题 1：家庭与社会" },
        soalan: {
            ms: "Institusi keluarga dan masyarakat memainkan peranan yang amat penting dalam mendepani pelbagai cabaran pada masa ini. Bincangkan peranan ibu bapa dan masyarakat dalam membentuk persekitaran hidup yang harmoni dan sejahtera.",
            en: "Family and community institutions play a very important role in facing various challenges today. Discuss the roles of parents and the community in shaping a harmonious and prosperous living environment.",
            zh: "家庭与社区机构在应对当今的各种挑战中扮演着非常重要的角色。试讨论父母与社会在塑造和谐与繁荣的生活环境中的作用。"
        },
        sets: [
            {
                title: { ms: "Set 1: Didikan Agama dan Moral (Peranan Ibu Bapa)", en: "Set 1: Religious and Moral Education", zh: "第 1 套：宗教与道德教育 (父母的角色)" },
                I: { ms: "Ibu bapa perlulah memberikan didikan agama dan ajaran moral yang secukupnya sejak kecil.", en: "Parents must provide sufficient religious and moral education since childhood.", zh: "父母必须从小给予充足的宗教与道德教育。" },
                M: { ms: "Pegangan agama bertindak sebagai benteng pertahanan diri daripada pengaruh negatif.", en: "Religious beliefs act as a self-defense barrier against negative influences.", zh: "宗教信仰能作为抵御负面影响的自我防线。" },
                Ba: { ms: "Mengajarkan asas ibadah dan membawa anak-anak ke tempat ibadat untuk aktiviti kerohanian.", en: "Teaching the basics of worship and bringing children to places of worship for spiritual activities.", zh: "教导基本礼拜，并带孩子到宗教场所进行精神活动。" },
                K: { ms: "Anak-anak dapat membezakan kebaikan dan keburukan lalu menjauhi gejala sosial.", en: "Children can differentiate between good and bad, thus staying away from social ills.", zh: "孩子们能分辨是非黑白，从而远离社会不良风气。" },
                U: { ms: "Melentur buluh biarlah dari rebungnya.", en: "To bend a bamboo, let it be from its shoot.", zh: "培育竹子要从竹笋开始。" },
                P: { ms: "Jelaslah, didikan agama merupakan asas utama dalam membentuk sahsiah remaja yang unggul.", en: "Clearly, religious education is the main foundation in shaping a superior adolescent personality.", zh: "显然，宗教教育是塑造青少年优秀品格的主要基础。" }
            },
            {
                title: { ms: "Set 2: Suri Teladan (Peranan Ibu Bapa)", en: "Set 2: Role Model (Parents)", zh: "第 2 套：榜样/模范 (父母的角色)" },
                I: { ms: "Ibu bapa mesti menjadi suri teladan (role model) yang positif kepada anak-anak.", en: "Parents must become positive role models to their children.", zh: "父母必须成为孩子们积极的榜样 (role model)。" },
                M: { ms: "Anak-anak mudah terpengaruh dan suka meniru tingkah laku orang yang paling rapat dengan mereka.", en: "Children are easily influenced and like to imitate the behavior of those closest to them.", zh: "孩子们很容易受影响，并喜欢模仿与他们最亲近的人的行为。" },
                Ba: { ms: "Ibu bapa menunjukkan amalan murni seperti rajin membaca, bersopan santun, dan tidak membuang masa.", en: "Parents display noble habits such as reading diligently, being polite, and not wasting time.", zh: "父母展现高尚的习惯，如勤奋阅读、温文尔雅以及不浪费时间。" },
                K: { ms: "Anak-anak akan terikut-ikut sikap positif tersebut dan membesar menjadi insan berguna.", en: "Children will follow these positive attitudes and grow up to be useful individuals.", zh: "孩子们会跟随这些积极的态度，长大后成为有用的人。" },
                U: { ms: "Bagaimana acuan, begitulah kuihnya.", en: "How the mold is, so is the cake / Like father, like son.", zh: "什么样的模子印出什么样的糕点 / 有其父必有其子。" },
                P: { ms: "Tegasnya, kepimpinan melalui teladan di rumah amat kritikal untuk dicontohi anak-anak.", en: "Firmly speaking, leadership by example at home is highly critical for children to emulate.", zh: "明确地说，在家里通过榜样来领导，对孩子们的效仿至关重要。" }
            },
            {
                title: { ms: "Set 3: Pemantauan Pergaulan (Peranan Ibu Bapa)", en: "Set 3: Monitoring Social Circles", zh: "第 3 套：监督交友圈 (父母的角色)" },
                I: { ms: "Ibu bapa wajar memantau pergaulan dan pergerakan anak-anak di luar rumah mahupun di alam siber.", en: "Parents should monitor their children's social circles and movements outside the house as well as in cyberspace.", zh: "父母应该监督孩子们在屋外以及网络世界中的交友和行踪。" },
                M: { ms: "Pengaruh rakan sebaya sangat kuat dan boleh menjerumuskan remaja ke lembah kehinaan.", en: "Peer influence is very strong and can plunge teenagers into the valley of disgrace.", zh: "同侪的影响力非常大，可能会将青少年推向堕落的深渊。" },
                Ba: { ms: "Mengambil tahu dengan siapa anak berkawan dan memeriksa penggunaan telefon pintar mereka secara berkala.", en: "Knowing who the children are friends with and periodically checking their smartphone usage.", zh: "了解孩子与谁交友，并定期检查他们智能手机的使用情况。" },
                K: { ms: "Anak-anak akan lebih berhati-hati memilih kawan dan terhindar daripada anasir jahat.", en: "Children will be more careful in choosing friends and be protected from bad elements.", zh: "孩子们在择友时会更谨慎，并免受不良分子的影响。" },
                U: { ms: "Mencegah lebih baik daripada mengubati.", en: "Prevention is better than cure.", zh: "预防胜于治疗。" },
                P: { ms: "Pendek kata, pemantauan yang ketat mampu menyelamatkan masa depan anak-anak.", en: "In short, strict monitoring can save the children's future.", zh: "简而言之，严格的监督能够拯救孩子们的未来。" }
            },
            {
                title: { ms: "Set 4: Amalan Gotong-Royong (Peranan Masyarakat)", en: "Set 4: Communal Work Practice", zh: "第 4 套：大扫除习惯 (社会的角色)" },
                I: { ms: "Masyarakat setempat haruslah membudayakan amalan gotong-royong.", en: "The local community must cultivate the practice of communal work (gotong-royong).", zh: "当地社区必须培养大扫除 (gotong-royong) 的风气。" },
                M: { ms: "Kerjasama dalam kalangan penduduk membolehkan sesuatu kerja yang berat diselesaikan dengan mudah dan cepat.", en: "Cooperation among residents allows heavy tasks to be completed easily and quickly.", zh: "居民之间的合作能让繁重的工作变得轻松且快速完成。" },
                Ba: { ms: "Membersihkan kawasan perumahan, menebas semak-samun, dan membersihkan longkang bersama-sama.", en: "Cleaning the housing area, clearing undergrowth, and cleaning drains together.", zh: "共同清理住宅区、清除杂草以及清理沟渠。" },
                K: { ms: "Persekitaran menjadi bersih dan nyamuk aedes tidak dapat membiak.", en: "The environment becomes clean and Aedes mosquitoes cannot breed.", zh: "环境变得清洁，黑斑蚊无法滋生。" },
                U: { ms: "Berat sama dipikul, ringan sama dijinjing.", en: "Heavy burdens are carried together, light burdens are hand-carried together.", zh: "重担共同挑起，轻担共同提携/有福同享，有难同当。" },
                P: { ms: "Konklusinya, gotong-royong bukan sahaja membersihkan alam sekitar, malah mengeratkan silaturahim.", en: "In conclusion, communal work not only cleans the environment but also strengthens community ties.", zh: "结论是，大扫除不仅能清洁环境，还能增进邻里感情。" }
            },
            {
                title: { ms: "Set 5: Sambutan Rumah Terbuka (Peranan Masyarakat/Negara)", en: "Set 5: Open House Celebration", zh: "第 5 套：举办门户开放 (社会/国家的角色)" },
                I: { ms: "Masyarakat pelbagai kaum digalakkan mengadakan amalan rumah terbuka ketika musim perayaan.", en: "Multi-racial communities are encouraged to hold open house practices during festive seasons.", zh: "鼓励各族人民在佳节期间举办门户开放 (rumah terbuka) 活动。" },
                M: { ms: "Amalan ini menyediakan platform untuk pelbagai etnik berinteraksi dan memahami budaya masing-masing.", en: "This practice provides a platform for various ethnicities to interact and understand each other's cultures.", zh: "这项活动提供了一个平台，让不同族群互动并了解彼此的文化。" },
                Ba: { ms: "Menjemput jiran tetangga berlainan bangsa untuk merasai juadah tradisional seperti ketupat, muruku, atau kuih bulan.", en: "Inviting neighbors of different races to taste traditional dishes such as ketupat, muruku, or mooncakes.", zh: "邀请不同种族的邻居来品尝传统美食，如马来粽 (ketupat)、姆鲁古 (muruku) 或月饼。" },
                K: { ms: "Tembok prejudis dapat diruntuhkan dan keharmonian antara kaum dapat dikukuhkan.", en: "The wall of prejudice can be torn down and harmony among races can be strengthened.", zh: "偏见的隔阂得以被打破，各族间的和谐得以巩固。" },
                U: { ms: "Bulat air kerana pembetung, bulat manusia kerana muafakat.", en: "Water becomes round because of the pipe, humans become united because of consensus.", zh: "水因容器而圆，人因共识而团结/团结就是力量。" },
                P: { ms: "Kesimpulannya, rumah terbuka merupakan medium yang berkesan untuk memupuk perpaduan nasional.", en: "In conclusion, open houses are an effective medium to foster national unity.", zh: "总而言之，门户开放是培养国家团结的有效媒介。" }
            }
        ]
    },
    {
        theme: { ms: "TEMA 2: KESIHATAN & KEBERSIHAN", en: "THEME 2: HEALTH & HYGIENE", zh: "主题 2：健康与卫生" },
        soalan: {
            ms: "Tular di media massa tentang kebimbangan masyarakat terhadap masalah kesihatan dan tahap kebersihan persekitaran yang semakin menjejaskan kualiti hidup. Huraikan langkah-langkah yang perlu diambil oleh setiap individu dan masyarakat untuk memelihara kesihatan diri serta kebersihan alam sekitar.",
            en: "It is viral in the mass media about the public's concern regarding health problems and environmental cleanliness levels that are increasingly affecting the quality of life. Elaborate on the steps that need to be taken by every individual and society to maintain personal health and environmental cleanliness.",
            zh: "大众媒体上流传着公众对健康问题以及日益影响生活质量的环境卫生水平的担忧。请详细说明每个人及社会应该采取哪些步骤来维持个人健康和环境清洁。"
        },
        sets: [
            {
                title: { ms: "Set 1: Pemakanan Seimbang (Langkah Individu)", en: "Set 1: Balanced Diet", zh: "第 1 套：均衡饮食 (个人步骤)" },
                I: { ms: "Setiap individu perlulah mengamalkan gaya pemakanan yang seimbang dan berkhasiat.", en: "Every individual must practice a balanced and nutritious dietary lifestyle.", zh: "每个人都应该实行均衡且有营养的饮食方式。" },
                M: { ms: "Tubuh badan memerlukan pelbagai nutrien yang mencukupi untuk berfungsi secara optimum.", en: "The body requires various sufficient nutrients to function optimally.", zh: "身体需要各种充足的营养素才能发挥最佳功能。" },
                Ba: { ms: "Mengambil makanan berpandukan Piramid Makanan Malaysia, iaitu melebihkan sayur-sayuran dan mengurangkan makanan berlemak.", en: "Consuming food based on the Malaysian Food Pyramid, which is eating more vegetables and reducing fatty foods.", zh: "根据马来西亚食物金字塔进食，即多吃蔬菜并减少高脂肪食物。" },
                K: { ms: "Sistem imuniti badan meningkat dan risiko mendapat penyakit kronik dapat dihindari.", en: "The body's immune system increases and the risk of getting chronic diseases can be avoided.", zh: "身体免疫系统提升，并能避免患上慢性疾病的风险。" },
                U: { ms: "Kesihatan itu lebih berharga daripada harta karun.", en: "Health is more valuable than treasure.", zh: "健康比财富更珍贵。" },
                P: { ms: "Tuntasnya, disiplin dalam pemakanan adalah kunci kepada kesejahteraan fizikal.", en: "To sum up, discipline in daily diet is the key to physical well-being.", zh: "总的来说，饮食上的自律是获得身体健康的关键。" }
            },
            {
                title: { ms: "Set 2: Aktiviti Riadah dan Senaman (Langkah Individu)", en: "Set 2: Recreational Activities and Exercise", zh: "第 2 套：休闲活动与运动 (个人步骤)" },
                I: { ms: "Kita wajar meluangkan masa untuk melakukan aktiviti riadah sekurang-kurangnya tiga kali seminggu.", en: "We should allocate time for recreational activities at least three times a week.", zh: "我们应该抽出时间进行休闲活动，每周至少三次。" },
                M: { ms: "Senaman membantu kelancaran aliran darah dan membakar kalori yang berlebihan.", en: "Exercise helps smooth blood circulation and burns excess calories.", zh: "运动有助于促进血液循环并燃烧多余的卡路里。" },
                Ba: { ms: "Melakukan aktiviti seperti berjoging di taman, berenang, atau berbasikal bersama rakan.", en: "Doing activities like jogging in the park, swimming, or cycling with friends.", zh: "与朋友一起在公园慢跑、游泳或骑自行车。" },
                K: { ms: "Badan menjadi cergas, otak menjadi cerdas, dan masalah obesiti dapat ditangani.", en: "The body becomes fit, the mind becomes sharp, and obesity problems can be tackled.", zh: "身体变得强壮，头脑变得敏捷，同时能解决肥胖问题。" },
                U: { ms: "Badan cergas, otak cerdas.", en: "A fit body, a sharp mind.", zh: "强健的体魄，敏捷的头脑。" },
                P: { ms: "Ringkasnya, senaman yang konsisten menjamin tahap kesihatan yang cemerlang.", en: "Briefly, consistent exercise guarantees an excellent level of health.", zh: "简而言之，持续的运动能确保卓越的健康水平。" }
            },
            {
                title: { ms: "Set 3: Pengurusan Tekanan/Stres (Kesihatan Mental)", en: "Set 3: Stress Management", zh: "第 3 套：压力管理 (心理健康)" },
                I: { ms: "Seseorang itu perlu bijak menguruskan tekanan emosi dan mental dengan baik.", en: "A person must be smart in managing emotional and mental stress well.", zh: "一个人必须善于妥善管理情绪和心理压力。" },
                M: { ms: "Stres yang tidak terkawal boleh mengganggu fokus kerja dan menyebabkan kemurungan (depression).", en: "Uncontrolled stress can disrupt work focus and cause depression.", zh: "无法控制的压力会干扰工作专注力并导致抑郁症 (kemurungan)。" },
                Ba: { ms: "Melakukan hobi yang disukai, berkongsi masalah dengan kaunselor, atau mengamalkan meditasi/solat.", en: "Doing favorite hobbies, sharing problems with a counselor, or practicing meditation/prayers.", zh: "从事喜欢的爱好、与辅导员分享问题，或进行冥想/祈祷。" },
                K: { ms: "Fikiran menjadi lebih tenang dan emosi sentiasa berada dalam keadaan stabil.", en: "The mind becomes calmer and emotions are always in a stable state.", zh: "思想变得更平静，情绪始终保持在稳定状态。" },
                U: { ms: "Sabar itu separuh daripada iman.", en: "Patience is half of faith.", zh: "忍耐是信仰的一半。" },
                P: { ms: "Hakikatnya, kesihatan mental sama pentingnya dengan kesihatan fizikal yang perlu dijaga rapi.", en: "The reality is, mental health is just as important as physical health that needs to be taken care of.", zh: "事实上，心理健康与需要被悉心照料的身体健康同等重要。" }
            },
            {
                title: { ms: "Set 4: Pemeriksaan Kesihatan Berkala (Langkah Individu)", en: "Set 4: Periodic Health Screening", zh: "第 4 套：定期体检 (个人步骤)" },
                I: { ms: "Masyarakat digalakkan untuk melakukan pemeriksaan kesihatan secara berkala sekurang-kurangnya setahun sekali.", en: "The public is encouraged to undergo periodic health screenings at least once a year.", zh: "鼓励民众定期进行健康检查，至少每年一次。" },
                M: { ms: "Banyak penyakit kronik seperti kanser dan darah tinggi tidak menunjukkan simptom pada peringkat awal.", en: "Many chronic diseases such as cancer and high blood pressure do not show symptoms in the early stages.", zh: "许多慢性疾病如癌症和高血压在初期不会表现出症状。" },
                Ba: { ms: "Melakukan ujian darah dan saringan kesihatan di hospital atau klinik berdekatan.", en: "Doing blood tests and health screenings at nearby hospitals or clinics.", zh: "在附近的医院或诊所进行血液测试和健康筛查。" },
                K: { ms: "Penyakit dapat dikesan lebih awal dan peluang untuk sembuh adalah lebih tinggi.", en: "Diseases can be detected earlier and the chances of recovery are higher.", zh: "疾病能及早被发现，治愈的机会也更高。" },
                U: { ms: "Sediakan payung sebelum hujan.", en: "Prepare the umbrella before it rains.", zh: "未雨绸缪。" },
                P: { ms: "Terbuktilah bahawa pencegahan awal melalui pemeriksaan doktor mampu menyelamatkan nyawa.", en: "It is proven that early prevention through doctor's check-ups can save lives.", zh: "事实证明，通过医生检查进行早期预防能够拯救生命。" }
            },
            {
                title: { ms: "Set 5: Penjagaan Kebersihan Persekitaran (Langkah Bersama)", en: "Set 5: Maintaining Environmental Cleanliness", zh: "第 5 套：维护环境卫生 (共同步骤)" },
                I: { ms: "Semua pihak mesti bekerjasama menjaga kebersihan kawasan persekitaran rumah.", en: "All parties must cooperate to maintain the cleanliness of the surrounding home environment.", zh: "各方必须齐心协力照顾住宅周围的环境卫生。" },
                M: { ms: "Kawasan yang kotor mengundang kehadiran vektor pembawa penyakit seperti nyamuk Aedes dan tikus.", en: "Dirty areas invite the presence of disease-carrying vectors such as Aedes mosquitoes and rats.", zh: "肮脏的区域会招来疾病传播媒介，如黑斑蚊和老鼠。" },
                Ba: { ms: "Memastikan tiada air bertakung di dalam pasu bunga dan membuang sampah ke dalam tong yang bertutup.", en: "Ensuring no stagnant water in flower pots and throwing rubbish into covered bins.", zh: "确保花盆内没有积水，并将垃圾丢进有盖的垃圾桶里。" },
                K: { ms: "Penularan penyakit berjangkit seperti demam denggi dan leptospirosis dapat disekat.", en: "The spread of infectious diseases like dengue fever and leptospirosis can be stopped.", zh: "骨痛热症和鼠尿病等传染病的蔓延得以被遏制。" },
                U: { ms: "Kebersihan sebahagian daripada iman.", en: "Cleanliness is part of faith.", zh: "清洁是信仰的一部分。" },
                P: { ms: "Kesimpulannya, persekitaran yang bersih menjamin tahap kesihatan awam yang baik.", en: "In conclusion, a clean environment guarantees a good level of public health.", zh: "结论是，清洁的环境能保障良好的公共健康水平。" }
            }
        ]
    },
    {
        theme: { ms: "TEMA 3: SEKOLAH & PENDIDIKAN", en: "THEME 3: SCHOOL & EDUCATION", zh: "主题 3：学校与教育" },
        soalan: {
            ms: "Sekolah bukan sahaja berfungsi sebagai tempat untuk menimba ilmu, malah merupakan medan utama untuk melahirkan modal insan yang berakhlak mulia. Jelaskan peranan pihak sekolah dan inisiatif pelajar dalam menjayakan matlamat pendidikan negara.",
            en: "The school functions not only as a place to gain knowledge, but also as a main arena to produce human capital with noble character. Explain the role of the school authorities and student initiatives in achieving the national education goals.",
            zh: "学校不仅是获取知识的地方，更是培养拥有高尚品德的人力资源的主要场所。请解释校方的作用以及学生在实现国家教育目标方面的积极举措。"
        },
        sets: [
            {
                title: { ms: "Set 1: Penguatkuasaan Peraturan Sekolah (Peranan Sekolah)", en: "Set 1: Enforcement of School Rules", zh: "第 1 套：执行学校规则 (学校的角色)" },
                I: { ms: "Pihak sekolah wajar mengetatkan peraturan dan mengenakan tindakan disiplin yang tegas.", en: "The school authorities should tighten rules and impose strict disciplinary actions.", zh: "校方应该收紧规则并采取严厉的纪律处分。" },
                M: { ms: "Pelajar akan berasa takut untuk melakukan kesalahan seperti ponteng sekolah atau vandalisme.", en: "Students will feel afraid to commit offenses such as playing truant or vandalism.", zh: "学生会因害怕而不敢犯错，如逃学或破坏公物。" },
                Ba: { ms: "Guru disiplin memberikan amaran, melaksanakan sesi rotan, atau menggantung persekolahan pelajar yang degil.", en: "Discipline teachers giving warnings, carrying out caning sessions, or suspending stubborn students.", zh: "纪律老师给予警告、执行鞭打，或让顽劣的学生停学。" },
                K: { ms: "Kadar masalah disiplin menurun dan suasana pembelajaran yang kondusif dapat diwujudkan.", en: "The rate of disciplinary problems decreases and a conducive learning atmosphere can be created.", zh: "纪律问题的发生率下降，并能营造有利的学习氛围。" },
                U: { ms: "Berani buat, berani tanggung / Lembu dipegang pada talinya, manusia dipegang pada janjinya.", en: "Dare to do, dare to bear the consequences / A cow is held by its rope, a human is held by their promise.", zh: "敢做敢当 / 牛被牵着绳，人被牵着诺言。" },
                P: { ms: "Tegasnya, ketegasan peraturan adalah elemen penting untuk mendisiplinkan pelajar.", en: "Firmly speaking, strict rules are an important element in disciplining students.", zh: "明确地说，严格的规则是管束学生纪律的重要元素。" }
            },
            {
                title: { ms: "Set 2: Kepentingan Kokurikulum (Kebaikan kepada Pelajar)", en: "Set 2: Importance of Co-curricular Activities", zh: "第 2 套：课外活动的重要性 (对学生的好处)" },
                I: { ms: "Pelajar wajib melibatkan diri secara aktif dalam aktiviti kokurikulum.", en: "Students must actively involve themselves in co-curricular activities.", zh: "学生必须积极参与课外活动。" },
                M: { ms: "Aktiviti ini dapat memupuk nilai kepimpinan, keyakinan diri, dan kemahiran komunikasi.", en: "These activities can foster leadership values, self-confidence, and communication skills.", zh: "这项活动能培养领导力、自信心和沟通技巧。" },
                Ba: { ms: "Menyertai perkhemahan unit beruniform atau menggalas jawatan AJK dalam kelab persatuan.", en: "Joining uniformed unit camps or shouldering committee positions in clubs.", zh: "参与制服团体的露营活动，或在学会中担任委员职务。" },
                K: { ms: "Pelajar membesar menjadi modal insan yang seimbang dari aspek jasmani, emosi, rohani, dan intelek (JERI).", en: "Students grow to become human capital that is balanced in physical, emotional, spiritual, and intellectual aspects (JERI).", zh: "学生成长为在生理、情感、精神和智力 (JERI) 方面均衡发展的人力资本。" },
                U: { ms: "Kalau tidak dipecahkan ruyung, manakan dapat sagunya.", en: "If the sago palm is not broken, how can one get the sago.", zh: "不入虎穴，焉得虎子。" },
                P: { ms: "Jelaslah bahawa kokurikulum melengkapkan kecemerlangan akademik seseorang murid.", en: "It is clear that co-curricular activities complete a student's academic excellence.", zh: "显然，课外活动完善了学生在学术上的卓越成就。" }
            },
            {
                title: { ms: "Set 3: Perkhidmatan Kaunseling (Peranan Sekolah)", en: "Set 3: Counseling Services", zh: "第 3 套：辅导服务 (学校的角色)" },
                I: { ms: "Unit Bimbingan dan Kaunseling di sekolah perlu proaktif mendekati pelajar bermasalah.", en: "The Guidance and Counseling Unit at school needs to proactively approach problematic students.", zh: "学校的辅导处必须主动接触有问题的学生。" },
                M: { ms: "Ramai pelajar mengalami masalah tekanan keluarga atau pembelajaran yang mendorong mereka bersikap negatif.", en: "Many students experience family pressure or learning problems that push them to behave negatively.", zh: "许多学生面临家庭压力或学习问题，促使他们表现出消极的态度。" },
                Ba: { ms: "Guru kaunseling mengadakan sesi luahan hati secara tertutup dan memberikan motivasi tanpa menghukum.", en: "Counseling teachers hold private heart-to-heart sessions and provide motivation without judging.", zh: "辅导老师进行私下的倾诉环节，并给予不带评判的激励。" },
                K: { ms: "Pelajar mendapat jalan penyelesaian yang rasional dan kembali fokus kepada pelajaran.", en: "Students get rational solutions and return their focus to their studies.", zh: "学生获得理性的解决方案，并重新专注于学业。" },
                U: { ms: "Hati gajah sama dilapah, hati kuman sama dicecah.", en: "An elephant's heart is carved together, a microbe's heart is dipped together.", zh: "有福同享，有难同当。" },
                P: { ms: "Konklusinya, pendekatan psikologi amat berkesan untuk merawat masalah emosi pelajar.", en: "In conclusion, psychological approaches are very effective in treating students' emotional problems.", zh: "结论是，心理学方法在治疗学生的心理情绪问题上非常有效。" }
            },
            {
                title: { ms: "Set 4: Kaedah Pembelajaran Interaktif (Peranan Guru)", en: "Set 4: Interactive Learning Methods", zh: "第 4 套：互动式学习法 (教师的角色)" },
                I: { ms: "Guru-guru perlu mengaplikasikan kaedah Pengajaran dan Pembelajaran (PdP) yang lebih interaktif.", en: "Teachers need to apply more interactive Teaching and Learning methods.", zh: "老师们需要应用更具互动性的教学法。" },
                M: { ms: "Gaya pengajaran tradisional yang membosankan menyebabkan pelajar hilang tumpuan di dalam kelas.", en: "Boring traditional teaching styles cause students to lose focus in class.", zh: "沉闷的传统教学方式会导致学生在课堂上失去注意力。" },
                Ba: { ms: "Menggunakan alat bantuan mengajar berunsur teknologi, video interaktif, atau kuiz gamifikasi (seperti Kahoot).", en: "Using technology-based teaching aids, interactive videos, or gamified quizzes.", zh: "使用结合科技的教学辅助工具、互动视频或游戏化测验。" },
                K: { ms: "Minat pelajar untuk belajar meningkat dan mereka lebih mudah memahami konsep yang sukar.", en: "Students' interest in learning increases and they can understand difficult concepts more easily.", zh: "学生学习的兴趣增加，也更容易理解困难的概念。" },
                U: { ms: "Guru kencing berdiri, murid kencing berlari.", en: "A teacher urinates standing, a student urinates running.", zh: "上梁不正下梁歪 (此处指老师对学生的强烈影响)。" },
                P: { ms: "Pendek kata, kreativiti pendidik adalah nadi kepada keberkesanan penyampaian ilmu.", en: "In short, educators' creativity is the lifeblood of effective knowledge delivery.", zh: "简而言之，教育工作者的创造力是有效传授知识的命脉。" }
            },
            {
                title: { ms: "Set 5: Mengisi Masa Cuti Sekolah (Tindakan Pelajar)", en: "Set 5: Filling the School Holidays", zh: "第 5 套：充实学校假期 (学生的行动)" },
                I: { ms: "Pelajar perlu bijak merancang dan mengisi masa cuti sekolah dengan aktiviti berfaedah.", en: "Students need to plan wisely and fill their school holidays with beneficial activities.", zh: "学生需要明智地规划，并以有益的活动来充实学校假期。" },
                M: { ms: "Masa yang terluang jika tidak dimanfaatkan akan menyebabkan pelajar membuang masa dan terjebak dengan gejala sosial.", en: "Free time, if not utilized, will cause students to waste time and get involved in social ills.", zh: "空闲时间若未被善用，将导致学生浪费时间并卷入社会问题。" },
                Ba: { ms: "Mengikuti kem motivasi, membuat kerja sambilan, atau membaca buku-buku ilmiah.", en: "Joining motivation camps, doing part-time jobs, or reading academic books.", zh: "参加激励营、做兼职工作，或阅读学术书籍。" },
                K: { ms: "Pelajar memperoleh ilmu tambahan, pengalaman baharu, dan matang dalam pemikiran.", en: "Students gain extra knowledge, new experiences, and mature in their thinking.", zh: "学生能获得额外的知识、新经验，并在思想上变得成熟。" },
                U: { ms: "Masa itu emas.", en: "Time is gold.", zh: "时间就是金钱。" },
                P: { ms: "Kesimpulannya, pengurusan masa yang bijak menentukan kejayaan masa depan seseorang pelajar.", en: "In conclusion, wise time management determines a student's future success.", zh: "总结来说，明智的时间管理决定了一个学生未来的成功。" }
            }
        ]
    },
    {
        theme: { ms: "TEMA 4: SUKAN & RIADAH", en: "THEME 4: SPORTS & RECREATION", zh: "主题 4：体育与休闲" },
        soalan: {
            ms: "Bidang sukan dan riadah didapati mampu memberikan pelbagai impak positif kepada individu mahupun negara, namun penyertaannya masih perlu diperkasakan lagi. Bincangkan kebaikan bersukan dan peranan kerajaan dalam memajukan industri sukan negara.",
            en: "The field of sports and recreation is found to be able to provide various positive impacts to individuals and the country, yet its participation still needs to be empowered. Discuss the benefits of sports and the role of the government in advancing the national sports industry.",
            zh: "体育和休闲领域被发现能够为个人和国家带来各种积极的影响，但其参与度仍需要加强。请讨论体育的好处以及政府在推动国家体育产业发展中的作用。"
        },
        sets: [
            {
                title: { ms: "Set 1: Memupuk Perpaduan Kaum (Kebaikan Sukan)", en: "Set 1: Fostering Racial Unity", zh: "第 1 套：培养种族团结 (体育的好处)" },
                I: { ms: "Sukan bertindak sebagai medium yang ampuh untuk menyatupadukan rakyat berbilang kaum.", en: "Sports act as a powerful medium to unite multi-racial citizens.", zh: "体育作为一种强大的媒介，能团结各族人民。" },
                M: { ms: "Sukan tidak mengira agama atau warna kulit dan semua penonton berkongsi matlamat yang sama.", en: "Sports do not discriminate by religion or skin color, and all spectators share the same goal.", zh: "体育不分宗教或肤色，所有观众都分享着共同的目标。" },
                Ba: { ms: "Rakyat bersorak menyokong pasukan badminton negara di stadium tanpa prejudis.", en: "Citizens cheering to support the national badminton team in the stadium without prejudice.", zh: "人民在体育场内毫无偏见地齐声为国家羽毛球队欢呼。" },
                K: { ms: "Silaturahim dan semangat kekitaan (esprit de corps) antara kaum dapat dipererat.", en: "Friendships and a sense of belonging (esprit de corps) among races can be tightened.", zh: "各族之间的情谊与团队精神 (esprit de corps) 得以加深。" },
                U: { ms: "Bersatu teguh, bercerai roboh.", en: "United we stand, divided we fall.", zh: "团结则存，分裂则亡。" },
                P: { ms: "Tuntasnya, sukan adalah bahasa universal yang menyatukan seluruh warganegara.", en: "To sum up, sports is a universal language that unites all citizens.", zh: "总的来说，体育是团结所有国民的通用语言。" }
            },
            {
                title: { ms: "Set 2: Mengharumkan Nama Negara (Kebaikan Sukan)", en: "Set 2: Bringing Glory to the Nation", zh: "第 2 套：为国争光 (体育的好处)" },
                I: { ms: "Pencapaian sukan yang cemerlang mampu melonjakkan imej negara di persada dunia.", en: "Excellent sports achievements can boost the country's image on the world stage.", zh: "卓越的体育成就能够提升国家在世界舞台上的形象。" },
                M: { ms: "Kemenangan atlet di pentas antarabangsa membuktikan kemampuan Malaysia bersaing dengan negara maju.", en: "Athletes' victories on the international stage prove Malaysia's capability to compete with developed nations.", zh: "运动员在国际舞台上的胜利，证明了马来西亚具备与发达国家竞争的能力。" },
                Ba: { ms: "Atlet seperti Datuk Nicol David dan Datuk Lee Chong Wei memenangi pingat emas dalam kejohanan dunia.", en: "Athletes like Datuk Nicol David and Datuk Lee Chong Wei winning gold medals in world championships.", zh: "像拿督妮柯尔·大卫和拿督李宗伟这样的运动员在世界锦标赛中赢得金牌。" },
                K: { ms: "Negara Malaysia dikenali di mata dunia dan rakyat berasa bangga.", en: "Malaysia becomes known in the eyes of the world and citizens feel proud.", zh: "马来西亚在世界上名声大噪，人民也感到自豪。" },
                U: { ms: "Harimau mati meninggalkan belang, manusia mati meninggalkan nama.", en: "Tigers die leaving their stripes, humans die leaving their names.", zh: "豹死留皮，人死留名。" },
                P: { ms: "Sesungguhnya, kejayaan atlet adalah kebanggaan yang mengharumkan nama nusa dan bangsa.", en: "Indeed, athletes' success is a pride that brings glory to the nation and its people.", zh: "确实，运动员的成功是让国家与民族名扬四海的骄傲。" }
            },
            {
                title: { ms: "Set 3: Menyediakan Peluang Kerjaya (Kebaikan Sukan)", en: "Set 3: Providing Career Opportunities", zh: "第 3 套：提供职业机会 (体育的好处)" },
                I: { ms: "Sukan kini telah berkembang menjadi satu industri yang menjanjikan masa depan kerjaya yang lumayan.", en: "Sports have now evolved into an industry that promises a lucrative future career.", zh: "体育如今已发展成为一个能带来丰厚职业前景的产业。" },
                M: { ms: "Jika dikomersialkan dengan baik, sukan bukan lagi sekadar hobi tetapi kerjaya profesional.", en: "If commercialized well, sports are no longer just a hobby but a professional career.", zh: "如果商业化得当，体育不再仅仅是爱好，而是专业职业。" },
                Ba: { ms: "Pelajar boleh menjadi atlet sepenuh masa, jurulatih bertauliah, atau pengurus sukan.", en: "Students can become full-time athletes, certified coaches, or sports managers.", zh: "学生可以成为全职运动员、认证教练或体育经理。" },
                K: { ms: "Taraf hidup atlet meningkat dan mereka mampu menjana pendapatan yang tinggi.", en: "Athletes' standard of living increases and they can generate a high income.", zh: "运动员的生活水平提高，他们能够创造高收入。" },
                U: { ms: "Di mana ada kemahuan, di situ ada jalan.", en: "Where there is a will, there is a way.", zh: "有志者，事竟成。" },
                P: { ms: "Jelaslah, bidang sukan menjanjikan pulangan ekonomi yang memberangsangkan.", en: "It is clear that the sports field promises encouraging economic returns.", zh: "显然，体育领域承诺了令人鼓舞的经济回报。" }
            },
            {
                title: { ms: "Set 4: Menjauhi Gejala Sosial (Kebaikan Sukan)", en: "Set 4: Staying Away from Social Ills", zh: "第 4 套：远离社会问题 (体育的好处)" },
                I: { ms: "Penglibatan remaja dalam aktiviti sukan menghalang mereka daripada terjebak dalam kancah maksiat.", en: "Teenagers' involvement in sports prevents them from falling into the abyss of vice.", zh: "青少年参与体育活动能阻止他们卷入罪恶的深渊。" },
                M: { ms: "Masa lapang remaja diisi secara optimum, mengelakkan mereka daripada berpeleseran atau bergaul dengan samseng jalanan.", en: "Teenagers' free time is filled optimally, preventing them from loitering or mixing with street thugs.", zh: "青少年的空闲时间被充分利用，避免他们游荡或与街头流氓为伍。" },
                Ba: { ms: "Menyertai kelab bola sepak di kampung atau menyertai pertandingan futsal pada hujung minggu.", en: "Joining a village football club or participating in weekend futsal tournaments.", zh: "参加村里的足球俱乐部，或在周末参加室内足球比赛。" },
                K: { ms: "Remaja dapat menyalurkan tenaga muda mereka ke arah yang positif dan produktif.", en: "Teenagers can channel their youthful energy towards positive and productive directions.", zh: "青少年能将他们年轻的精力引导向积极且富有成效的方向。" },
                U: { ms: "Masa lapang jika tidak diisi dengan kebaikan, pasti diisi dengan keburukan.", en: "Free time, if not filled with good, will certainly be filled with bad.", zh: "空闲时间若不以善填补，必被恶占据。" },
                P: { ms: "Konklusinya, aktiviti riadah adalah perisai pelindung belia daripada keruntuhan moral.", en: "In conclusion, recreational activities act as a protective shield for youth against moral decay.", zh: "结论是，休闲活动是保护青年免受道德沦丧的防护盾。" }
            },
            {
                title: { ms: "Set 5: Pembangunan Prasarana Sukan (Peranan Kerajaan)", en: "Set 5: Development of Sports Infrastructure", zh: "第 5 套：建设体育基础设施 (政府的角色)" },
                I: { ms: "Pihak kerajaan perlu membina lebih banyak kemudahan sukan yang lengkap dan bertaraf dunia.", en: "The government needs to build more comprehensive and world-class sports facilities.", zh: "政府需要建设更多完善且世界级的体育设施。" },
                M: { ms: "Prasarana yang baik akan menggalakkan lebih ramai rakyat bersukan dan melahirkan atlet berbakat.", en: "Good infrastructure will encourage more citizens to do sports and produce talented athletes.", zh: "良好的基础设施将鼓励更多人民参与体育，并培养出有天赋的运动员。" },
                Ba: { ms: "Membina kompleks belia dan sukan, trek larian yang selamat, dan velodrom di setiap daerah.", en: "Building youth and sports complexes, safe running tracks, and velodromes in every district.", zh: "在每个县建设青年与体育综合中心、安全的跑道以及自行车馆。" },
                K: { ms: "Atlet dapat berlatih dengan selesa dan rakyat mudah mengakses kemudahan riadah awam.", en: "Athletes can train comfortably and citizens can easily access public recreational facilities.", zh: "运动员可以舒适地训练，人民也能轻易使用公共休闲设施。" },
                U: { ms: "Kalau tidak dipecahkan ruyung, manakan dapat sagunya.", en: "If the sago palm is not broken, how can one get the sago.", zh: "不入虎穴，焉得虎子。" },
                P: { ms: "Tegasnya, pelaburan dalam infrastruktur sukan mencerminkan komitmen negara membangunkan arena sukan.", en: "Firmly speaking, investments in sports infrastructure reflect the country's commitment to developing the sports arena.", zh: "明确地说，对体育基础设施的投资反映了国家发展体育领域的决心。" }
            }
        ]
    },
    {
        theme: { ms: "TEMA 5: SAINS, TEKNOLOGI & INOVASI", en: "THEME 5: SCIENCE, TECHNOLOGY & INNOVATION", zh: "主题 5：科学、科技与创新" },
        soalan: {
            ms: "Perkembangan pesat dalam bidang sains, teknologi, dan inovasi telah mengubah landskap kehidupan manusia menjadikan segala-galanya lebih mudah, namun pada masa yang sama, mencetuskan pelbagai risiko. Huraikan kebaikan serta kesan buruk penggunaan teknologi pintar dalam kalangan masyarakat.",
            en: "The rapid development in the fields of science, technology, and innovation has changed the landscape of human life, making everything easier, but at the same time, sparking various risks. Elaborate on the benefits and negative effects of using smart technology among society.",
            zh: "科学、技术与创新领域的快速发展改变了人类生活的面貌，使一切变得更简单，但与此同时也引发了各种风险。请阐述在社会中使用智能科技的好处与坏处。"
        },
        sets: [
            {
                title: { ms: "Set 1: Capaian Maklumat Pantas (Kebaikan Internet)", en: "Set 1: Fast Information Access", zh: "第 1 套：快速获取信息 (互联网的好处)" },
                I: { ms: "Internet membolehkan masyarakat mencari dan mengakses pelbagai maklumat dengan pantas.", en: "The internet allows society to search and access various information quickly.", zh: "互联网让人们能够快速搜索并获取各种信息。" },
                M: { ms: "Manusia tidak lagi perlu bergantung sepenuhnya kepada buku fizikal yang terhad atau perlu ke perpustakaan.", en: "Humans no longer need to rely entirely on limited physical books or go to the library.", zh: "人类不再需要完全依赖有限的实体书，也不必去图书馆。" },
                Ba: { ms: "Menggunakan enjin carian seperti Google untuk menyiapkan tugasan sekolah atau mencari berita terkini.", en: "Using search engines like Google to complete school assignments or find the latest news.", zh: "使用如 Google 的搜索引擎来完成学校作业或寻找最新新闻。" },
                K: { ms: "Masyarakat menjadi lebih berilmu pengetahuan dan tahap literasi maklumat meningkat.", en: "Society becomes more knowledgeable and the level of information literacy increases.", zh: "社会变得更有知识，信息素养水平也随之提高。" },
                U: { ms: "Maklumat di hujung jari.", en: "Information at your fingertips.", zh: "信息尽在指尖。" },
                P: { ms: "Tuntasnya, kemajuan teknologi memecahkan sempadan ilmu untuk diakses oleh semua pihak.", en: "To sum up, technological advancements break the boundaries of knowledge for everyone to access.", zh: "总的来说，科技的进步打破了知识的边界，让所有人都能获取。" }
            },
            {
                title: { ms: "Set 2: Kaedah Pembelajaran Abad Ke-21 (Kebaikan Teknologi)", en: "Set 2: 21st Century Learning Methods", zh: "第 2 套：21世纪学习法 (科技的好处)" },
                I: { ms: "Penggunaan teknologi seperti komputer dan projektor menjadikan proses pembelajaran lebih menarik.", en: "The use of technology like computers and projectors makes the learning process more interesting.", zh: "使用电脑和投影仪等科技让学习过程变得更具吸引力。" },
                M: { ms: "Visual dan audio yang interaktif dapat merangsang minda serta daya ingatan pelajar berbanding tulisan di papan putih.", en: "Interactive visuals and audio can stimulate students' minds and memories better than writing on a whiteboard.", zh: "与白板上的文字相比，互动的视听效果更能刺激学生的思维和记忆力。" },
                Ba: { ms: "Guru menayangkan video eksperimen sains atau pelajar menghantar tugasan melalui portal e-pembelajaran.", en: "Teachers showing science experiment videos or students submitting assignments via e-learning portals.", zh: "老师播放科学实验视频，或学生通过电子学习门户网站提交作业。" },
                K: { ms: "Kefahaman pelajar meningkat secara drastik dan suasana kelas menjadi ceria.", en: "Students' understanding increases drastically and the classroom atmosphere becomes cheerful.", zh: "学生的理解力大幅提升，课堂氛围变得活跃。" },
                U: { ms: "Selangkah ke alam siber, sejuta ilmu digarap.", en: "One step into the cyber world, a million pieces of knowledge are gathered.", zh: "踏入网络一步，汲取百万知识。" },
                P: { ms: "Sesungguhnya, integrasi teknologi dalam pendidikan adalah pemangkin kecemerlangan akademik masa kini.", en: "Indeed, the integration of technology in education is the catalyst for modern academic excellence.", zh: "确实，将科技融入教育是当今卓越学术表现的催化剂。" }
            },
            {
                title: { ms: "Set 3: Risiko Ketagihan Gajet (Kesan Buruk Teknologi)", en: "Set 3: Risk of Gadget Addiction", zh: "第 3 套：对电子产品上瘾的风险 (科技的坏处)" },
                I: { ms: "Penggunaan telefon pintar tanpa kawalan akan menyebabkan masalah ketagihan yang serius.", en: "The uncontrolled use of smartphones will cause serious addiction problems.", zh: "毫无节制地使用智能手机会导致严重的成瘾问题。" },
                M: { ms: "Aplikasi permainan video dan media sosial direka khas untuk membuatkan pengguna leka berjam-jam lamanya.", en: "Video games and social media applications are specially designed to make users engrossed for hours.", zh: "电子游戏和社交媒体应用经过专门设计，会让用户沉迷数小时。" },
                Ba: { ms: "Pelajar berjaga sehingga larut malam bermain e-sports (sukan elektronik) atau melayari TikTok.", en: "Students staying up late playing e-sports or browsing TikTok.", zh: "学生熬夜玩电子竞技或浏览 TikTok。" },
                K: { ms: "Pelajar kehilangan fokus di dalam kelas, kualiti tidur merosot, dan kesihatan mata terjejas.", en: "Students lose focus in class, sleep quality deteriorates, and eye health is compromised.", zh: "学生在课堂上失去专注力，睡眠质量下降，眼睛健康受损。" },
                U: { ms: "Yang dikejar tak dapat, yang dikendong berciciran.", en: "The pursued is not caught, and what is carried drops away.", zh: "追求不到，反而失去原有的 / 赔了夫人又折兵。" },
                P: { ms: "Kesimpulannya, ketaksuban terhadap gajet membawa kemudaratan fizikal dan mental jika tidak dibendung.", en: "In conclusion, obsession with gadgets brings physical and mental harm if not curbed.", zh: "结论是，如果不加以遏制，对电子产品的痴迷会带来身心伤害。" }
            },
            {
                title: { ms: "Set 4: Ancaman Jenayah Siber (Kesan Buruk Teknologi)", en: "Set 4: Threat of Cybercrime", zh: "第 4 套：网络犯罪的威胁 (科技的坏处)" },
                I: { ms: "Ruang siber yang terbuka luas mendedahkan pengguna kepada ancaman penggodam dan penipu siber (scammer).", en: "The wide-open cyberspace exposes users to the threats of hackers and cyber scammers.", zh: "广阔的网络空间让用户暴露在黑客和网络骗子 (scammer) 的威胁之下。" },
                M: { ms: "Kurangnya tahap kesedaran keselamatan IT membolehkan pihak tidak bertanggungjawab mencuri data peribadi.", en: "A lack of IT security awareness allows irresponsible parties to steal personal data.", zh: "缺乏 IT 安全意识让不负责任的人有机会窃取个人数据。" },
                Ba: { ms: "Penjenayah siber memperdaya mangsa melalui panggilan palsu (Macau Scam) atau pautan fail berisiko (APK).", en: "Cybercriminals deceive victims through fake calls (Macau Scam) or risky file links (APK).", zh: "网络罪犯通过诈骗电话 (澳门骗局) 或高风险文件链接 (APK) 欺骗受害者。" },
                K: { ms: "Mangsa akan mengalami kerugian wang ringgit mencecah ribuan ringgit dalam sekelip mata.", en: "Victims will experience financial losses reaching thousands of ringgit in the blink of an eye.", zh: "受害者会在眨眼间遭受高达数千令吉的财务损失。" },
                U: { ms: "Sepandai-pandai tupai melompat, akhirnya jatuh ke tanah jua.", en: "No matter how well a squirrel jumps, it will eventually fall to the ground.", zh: "松鼠跳得再好，最终也会落回地面。" },
                P: { ms: "Jelaslah, sikap berwaspada dan literasi keselamatan siber sangat penting di era digital ini.", en: "It is clear that vigilance and cybersecurity literacy are very important in this digital era.", zh: "显然，在数字时代，保持警惕的态度和网络安全知识非常重要。" }
            },
            {
                title: { ms: "Set 5: Memudahkan Komunikasi Jarak Jauh (Kebaikan Teknologi)", en: "Set 5: Facilitating Long-Distance Communication", zh: "第 5 套：便利远距离通信 (科技的好处)" },
                I: { ms: "Aplikasi komunikasi pintar membolehkan manusia berhubung merentasi benua tanpa batasan geografi.", en: "Smart communication applications allow humans to connect across continents without geographical boundaries.", zh: "智能通讯应用让人们能够跨越地理界限，连接各大洲。" },
                M: { ms: "Sistem komunikasi tradisional seperti surat menyurat memakan masa yang lama dan kos yang tinggi.", en: "Traditional communication systems like letter writing take a long time and incur high costs.", zh: "如写信等传统的通讯系统耗时较长且成本高昂。" },
                Ba: { ms: "Menggunakan aplikasi WhatsApp, Telegram, atau panggilan video melalui Zoom untuk berhubung dengan keluarga di luar negara.", en: "Using applications like WhatsApp, Telegram, or video calls via Zoom to connect with family abroad.", zh: "使用 WhatsApp、Telegram 或通过 Zoom 进行视频通话，与在国外的家人保持联系。" },
                K: { ms: "Kos dapat dijimatkan, maklumat penting dapat disampaikan segera, dan silaturahim kekal terjalin.", en: "Costs are saved, important information can be delivered immediately, and family ties are maintained.", zh: "节省了成本，重要信息得以迅速传达，亲情也得以维持。" },
                U: { ms: "Jauh di mata, dekat di hati.", en: "Far from the eyes, close to the heart.", zh: "距离虽远，心却相连。" },
                P: { ms: "Tegasnya, inovasi telekomunikasi merapatkan jurang fizikal manusia sejagat.", en: "Firmly speaking, telecommunications innovations bridge the physical gap between all of humanity.", zh: "明确地说，电讯的创新缩小了全人类的物理距离。" }
            }
        ]
    }
];

let currentThemeIdx = 0;
let currentSetIdx = 0;
let currentStep = 1;
const totalSteps = 6;

// Audio Synthesizer for sound effects
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'success') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.2);
    }
}

// Translation state defaults
let showEN = false;
let showZH = false;

// Helpers to format text
function formatText(obj) {
    if (!obj) return "";
    let res = `<div class="lang-text ms-text">${obj.ms}</div>`;
    if (obj.en) res += `<div class="lang-text en-text">${obj.en}</div>`;
    if (obj.zh) res += `<div class="lang-text zh-text">${obj.zh}</div>`;
    return res;
}

function formatTitle(obj) {
    if (!obj) return "";
    let res = `<span class="ms-text">${obj.ms}</span>`;
    if (obj.en) res += `<span class="en-text"> / ${obj.en}</span>`;
    if (obj.zh) res += `<span class="zh-text"> / ${obj.zh}</span>`;
    return res;
}

function toggleLang(lang) {
    playSound('click');
    if (lang === 'en') {
        showEN = !showEN;
        document.body.classList.toggle('show-en', showEN);
        document.getElementById('btn-en').classList.toggle('active', showEN);
    }
    if (lang === 'zh') {
        showZH = !showZH;
        document.body.classList.toggle('show-zh', showZH);
        document.getElementById('btn-zh').classList.toggle('active', showZH);
    }
}

function saveCurrentProgress() {
    if (window.ProgressTracker && ProgressTracker.getActiveStudent()) {
        ProgressTracker.save({
            currentTheme: currentThemeIdx,
            currentSet: parseInt(currentSetIdx),
            currentStep: currentStep
        });
    }
}

async function initApp() {
    // Show active student badge
    if (window.ProgressTracker) {
        const student = ProgressTracker.getActiveStudent();
        if (student) {
            const badge = document.getElementById('activeStudentBadge');
            if (badge) {
                badge.style.display = 'inline-block';
                document.getElementById('activeStudentName').innerText = student;
            }

            // Restore saved progress from Supabase
            const saved = await ProgressTracker.load();
            if (saved && saved.progress_data) {
                const p = saved.progress_data;
                currentThemeIdx = p.currentTheme ?? 0;
                currentSetIdx = p.currentSet ?? 0;
                currentStep = p.currentStep ?? 1;
            }
        }
    }

    setupThemeGrid();
    updateSets();

    if (currentStep > 1) {
        goToStep(currentStep);
    }
}

function setupThemeGrid() {
    const grid = document.getElementById("themeGrid");
    grid.innerHTML = "";
    db.forEach((t, index) => {
        let btn = document.createElement("button");
        btn.className = "theme-btn" + (index === currentThemeIdx ? " active" : "");
        btn.innerHTML = formatTitle(t.theme);
        btn.onclick = () => {
            playSound('click');
            currentThemeIdx = index;
            currentSetIdx = 0;
            currentStep = 1;
            setupThemeGrid();
            updateSets();
            goToStep(1);
            saveCurrentProgress();
        };
        grid.appendChild(btn);
    });
}

function updateSets() {
    const setSel = document.getElementById("setSelect");
    setSel.innerHTML = "";

    db[currentThemeIdx].sets.forEach((s, index) => {
        let opt = document.createElement("option");
        opt.value = index;
        opt.innerHTML = formatTitle(s.title);
        setSel.appendChild(opt);
    });
    setSel.value = currentSetIdx;

    // Add event listener to the select to play sound on change
    setSel.onchange = () => {
        playSound('click');
        currentSetIdx = document.getElementById("setSelect").value;
        saveCurrentProgress();
        renderDashboard();
    };

    renderDashboard();
}

function renderDashboard() {
    currentSetIdx = document.getElementById("setSelect").value;
    const data = db[currentThemeIdx].sets[currentSetIdx];

    // Interaksi 1: Flip Cards
    const fcContainer = document.getElementById("flip-cards-container");
    fcContainer.innerHTML = "";
    const letters = ['I', 'M', 'Ba', 'K', 'U', 'P'];
    const labels = {
        I: { ms: "Isi", en: "Point", zh: "论点" },
        M: { ms: "Mengapa", en: "Reason", zh: "原因" },
        Ba: { ms: "Bagaimana", en: "How", zh: "例子" },
        K: { ms: "Kesan", en: "Impact", zh: "影响" },
        U: { ms: "Ungkapan", en: "Proverb", zh: "优美语句" },
        P: { ms: "Penegasan", en: "Emphasis", zh: "强调" }
    };

    letters.forEach(l => {
        const cardHtml = `
            <div class="flip-card" onclick="this.classList.toggle('flipped'); playSound('click');">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div class="letter">${l}</div>
                        <div class="label">${formatText(labels[l])}</div>
                    </div>
                    <div class="flip-card-back">
                        ${formatText(data[l])}
                    </div>
                </div>
            </div>
        `;
        fcContainer.innerHTML += cardHtml;
    });

    // Interaksi 2: Tabs (Variations)
    const tms = {
        tab1_pre: { ms: "Sebagai pembuka tirai perbincangan, fokus utama ialah", en: "As the curtain raiser, the main focus is", zh: "作为讨论的开端，必须给予关注的主要焦点是" },
        tab1_mid: { ms: "Secara rasionalnya, hal ini penting kerana", en: "Rationally, this is important because", zh: "从理性的角度来看，这非常重要因为" },
        tab2_pre: { ms: "Meninjau dari skop yang berbeza, kita tidak boleh menafikan bahawa", en: "Reviewing from a different scope, we cannot deny that", zh: "从不同的范围来审视，我们也不能否认" },
        tab2_mid: { ms: "Tindakan ini tidak seharusnya dipandang sepi memandangkan", en: "This action should not be ignored considering", zh: "这种情况不应该被忽视，因为" },
        tab3_pre: { ms: "Dari perspektif yang lebih holistik, gagasan penting adalah memastikan", en: "From a more holistic perspective, an important notion is ensuring", zh: "从更全面的视角来看，同样重要的主张是确保" },
        tab3_mid: { ms: "Jika ditelusuri hingga ke akar umbi, rasional di sebalik hal ini tercetus kerana", en: "If traced to the roots, the rationale behind this is triggered because", zh: "如果追溯到根本，这背后的理据是因为" }
    };

    // Helper to generate the text content for tabs based on language state
    function buildTabContent(preText, midText, I, M, Ba, K, U, P) {
        let res = "";

        let msText = `<span class="highlight">${preText.ms}</span> ${I.ms} <span class="highlight">${midText.ms}</span> ${M.ms} ${Ba.ms} ${K.ms} <span class="highlight">${U.ms}</span> ${P.ms}`;
        res += `<div class="lang-text ms-text">${msText}</div>`;

        let enText = `<span class="highlight">${preText.en}</span> ${I.en} <span class="highlight">${midText.en}</span> ${M.en} ${Ba.en} ${K.en} <span class="highlight">${U.en}</span> ${P.en}`;
        res += `<div class="lang-text en-text" style="margin-top:15px; font-size: 0.9em; opacity: 0.9;">${enText}</div>`;

        let zhText = `<span class="highlight">${preText.zh}</span> ${I.zh} <span class="highlight">${midText.zh}</span> ${M.zh} ${Ba.zh} ${K.zh} <span class="highlight">${U.zh}</span> ${P.zh}`;
        res += `<div class="lang-text zh-text" style="margin-top:15px; font-size: 0.9em; opacity: 0.9;">${zhText}</div>`;

        return res;
    }

    document.getElementById("tab1").innerHTML = buildTabContent(tms.tab1_pre, tms.tab1_mid, data.I, data.M, data.Ba, data.K, data.U, data.P);
    document.getElementById("tab2").innerHTML = buildTabContent(tms.tab2_pre, tms.tab2_mid, data.I, data.M, data.Ba, data.K, data.U, data.P);
    document.getElementById("tab3").innerHTML = buildTabContent(tms.tab3_pre, tms.tab3_mid, data.I, data.M, data.Ba, data.K, data.U, data.P);

    // Interaksi 3: Quiz Logic
    document.getElementById("quiz-I").innerHTML = formatText(data.I);

    const qSelect = document.getElementById("quiz-M-select");
    qSelect.innerHTML = `<option value="">-- Pilih / Select / 选择 --</option>`;

    let options = [{ text: data.M, val: "correct" }];
    let wrongSets = db[currentThemeIdx].sets.filter((_, idx) => idx != currentSetIdx);
    if (wrongSets.length >= 2) {
        options.push({ text: wrongSets[0].M, val: "wrong1" });
        options.push({ text: wrongSets[1].M, val: "wrong2" });
    }
    options.sort(() => Math.random() - 0.5);
    options.forEach(o => {
        let opt = document.createElement("option");
        opt.value = o.val;
        opt.innerHTML = formatTitle(o.text);
        qSelect.appendChild(opt);
    });
    document.getElementById("quiz-feedback").innerText = "";
    document.getElementById("quiz-feedback").style.color = "";

    // Interaksi 4: Builder
    setupBuilder(data);

    // Interaksi 5: Vocab List for the current Theme
    const vContainer = document.getElementById("vocab-container");
    vContainer.innerHTML = "";
    db[currentThemeIdx].sets.forEach(s => {
        let uText = formatText(s.U);
        let kText = formatText(s.K);
        vContainer.innerHTML += `
            <div class="vocab-item">
                <h4>${uText}</h4>
                <div class="meaning">
                    <strong>Contoh Penggunaan:</strong> <br>
                    ${kText} Ini bertepatan dengan peribahasa, <em>${uText}</em>
                </div>
            </div>
        `;
    });

    // Interaksi 6: Rangka Karangan Exercise (Soalan & Isi)
    const qContainer = document.getElementById("spm-question-text");
    if (qContainer && db[currentThemeIdx].soalan) {
        qContainer.innerHTML = formatText(db[currentThemeIdx].soalan);
    }

    const eContainer = document.getElementById("essay-content-container");
    if (eContainer) {
        eContainer.innerHTML = "";

        // Grab up to 3 sets from the current theme to use as Isi 1, 2, 3
        const setsToUse = db[currentThemeIdx].sets.slice(0, 3);

        setsToUse.forEach((s, idx) => {
            let num = idx + 1;
            let title = `ISI ${num}: ${s.M.ms.split(' ').slice(0, 4).join(' ')}...`; // Generate a short title

            eContainer.innerHTML += `
                <div class="fw-card imbakup-content-item">
                    <h4>Isi ${num} <em>(Sila susun ke dalam Rangka Karangan di sebelah kiri)</em></h4>
                    
                    <div class="imbakup-point">
                        <span class="imbakup-label">I</span>
                        <div class="imbakup-text">${formatText(s.I)}</div>
                    </div>
                    
                    <div class="imbakup-point">
                        <span class="imbakup-label">M</span>
                        <div class="imbakup-text">${formatText(s.M)}</div>
                    </div>

                    <div class="imbakup-point">
                        <span class="imbakup-label">Ba</span>
                        <div class="imbakup-text">${formatText(s.Ba)}</div>
                    </div>

                    <div class="imbakup-point">
                        <span class="imbakup-label">K</span>
                        <div class="imbakup-text">${formatText(s.K)}</div>
                    </div>

                    <div class="imbakup-point">
                        <span class="imbakup-label">U</span>
                        <div class="imbakup-text">${formatText(s.U)}</div>
                    </div>

                    <div class="imbakup-point">
                        <span class="imbakup-label">P</span>
                        <div class="imbakup-text">${formatText(s.P)}</div>
                    </div>
                </div>
            `;
        });
    }
}

// ==========================================
// BUILDER LOGIC
// ==========================================
function setupBuilder(data) {
    const bGroup = document.getElementById("builder-buttons");
    bGroup.innerHTML = "";
    document.getElementById("builder-result").innerHTML = "";
    document.getElementById("builder-msg").innerHTML = "";

    const parts = ['U', 'M', 'Ba', 'I', 'P', 'K'];
    const labels = { I: "I", M: "M", Ba: "Ba", K: "K", U: "U", P: "P" };

    parts.forEach(p => {
        let btn = document.createElement("button");
        btn.className = "sentence-btn";
        btn.innerHTML = `<strong>[${labels[p]}]</strong> ${formatText(data[p])}`;
        btn.onclick = function () {
            playSound('click');
            let span = document.createElement("span");
            span.innerHTML = this.innerHTML + "<br><br>";
            span.onclick = function () {
                playSound('click');
                this.remove();
                btn.style.display = "block";
                checkBuilderOrder();
            };
            document.getElementById("builder-result").appendChild(span);
            this.style.display = "none";
            checkBuilderOrder();
        };
        bGroup.appendChild(btn);
    });
}

function checkBuilderOrder() {
    const resBox = document.getElementById("builder-result");
    const addedCount = resBox.children.length;
    let msgEl = document.getElementById("builder-msg");
    if (addedCount === 6) {
        playSound('success');
        msgEl.innerHTML = formatText({
            ms: "🎉 Syabas! Perenggan anda telah lengkap terbentuk.",
            en: "🎉 Excellent! Your paragraph is completely formed.",
            zh: "🎉 太棒了！你的段落已完全成型。"
        });
    } else {
        msgEl.innerHTML = "";
    }
}

function resetBuilder() {
    playSound('click');
    renderDashboard();
}

// ==========================================
// QUIZ & TAB & LANG LOGIC
// ==========================================
function checkQuiz() {
    let val = document.getElementById("quiz-M-select").value;
    let fb = document.getElementById("quiz-feedback");
    if (val === "correct") {
        playSound('success');
        fb.style.color = "var(--success)";
        fb.innerHTML = formatText({
            ms: "✓ Tepat sekali! Hubung kait fakta dan sebab adalah logik.",
            en: "✓ Exactly! The connection between fact and reason is logical.",
            zh: "✓ 非常准确！事实与原因的联系是符合逻辑的。"
        });
    } else if (val === "") {
        fb.innerHTML = "";
    } else {
        playSound('error');
        fb.style.color = "var(--error)";
        fb.innerHTML = formatText({
            ms: "✗ Kurang tepat. Sebab (Mengapa) yang dipilih tidak selari dengan Isi.",
            en: "✗ Incorrect. The chosen reason does not align with the point.",
            zh: "✗ 不准确。所选的原因与论点不一致。"
        });
    }
}

function openTab(evt, tabName) {
    playSound('click');
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }
    tablinks = document.getElementsByClassName("tab-btn");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    setTimeout(() => { document.getElementById(tabName).classList.add("active"); }, 10);
    evt.currentTarget.className += " active";
}

// ==========================================
// STEP NAVIGATION LOGIC
// ==========================================
function goToStep(stepNum) {
    playSound('click');
    currentStep = stepNum;
    updateStepVisibility();
    saveCurrentProgress();
}

function navStep(direction) {
    playSound('click');
    let newStep = currentStep + direction;
    if (newStep > totalSteps) {
        endCourse();
        return;
    }
    if (newStep >= 1 && newStep <= totalSteps) {
        currentStep = newStep;
        updateStepVisibility();
        saveCurrentProgress();
    }
}

function endCourse() {
    playSound('success');

    // Add a simple congratulations overlay
    const overlay = document.createElement('div');
    overlay.id = 'congrats-overlay';
    overlay.innerHTML = `
        <div class="congrats-content">
            <h1 style="color: #fbbf24; font-size: 3rem; margin-bottom: 20px;">🎉 TAHNIAH! 🎉</h1>
            <p style="font-size: 1.5rem; margin-bottom: 30px;">
                <span class="lang-text ms-text">Anda telah berjaya menamatkan modul teknik karangan ini.</span>
                <span class="lang-text en-text">You have successfully completed this essay technique module.</span>
                <span class="lang-text zh-text">你已成功完成此作文技巧模块。</span>
            </p>
            <div class="medal-icon" style="font-size: 5rem; margin-bottom: 30px;">🏆</div>
            <p style="opacity: 0.8;">Sila tunggu sebentar, anda akan dibawa pulang ke laman utama...</p>
        </div>
    `;
    document.body.appendChild(overlay);

    // Basic confetti effect using internal divs if external lib is not loaded
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti-piece';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = ['#fbbf24', '#e74c3c', '#1a5276', '#27ae60', '#f39c12'][Math.floor(Math.random() * 5)];
        confetti.style.animationDelay = Math.random() * 2 + 's';
        document.body.appendChild(confetti);
    }

    // Redirect after 4 seconds
    setTimeout(() => {
        window.location.href = "../../../../../index.html";
    }, 4500);
}

function updateStepVisibility() {
    // Hide all sections
    const sections = document.getElementsByClassName("step-section");
    for (let i = 0; i < sections.length; i++) {
        sections[i].classList.remove("active");
    }

    // Show active section
    const activeSection = document.getElementById("step" + currentStep);
    if (activeSection) {
        activeSection.classList.add("active");
    }

    // Update progress tabs
    const progTabs = document.getElementsByClassName("prog-btn");
    for (let i = 0; i < progTabs.length; i++) {
        progTabs[i].classList.remove("active");
        if (i + 1 === currentStep) {
            progTabs[i].classList.add("active");
        }
    }

    // Option to scroll to top of selector if desired
    // document.querySelector(".selector-box").scrollIntoView({ behavior: 'smooth' });
}

// Start app
window.onload = initApp;
