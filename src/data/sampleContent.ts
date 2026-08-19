import type { ContentBlock, BookSection } from '@/types';

const intro: ContentBlock[] = [
  {
    type: 'paragraph',
    text: 'This work is offered as an introductory exploration of the Islamic intellectual tradition — its foundations, principles, and enduring relevance. It is written for the student beginning a journey of study, and for the general reader seeking a structured overview of how scholars across centuries approached the task of understanding faith, knowledge, and conduct.',
  },
  {
    type: 'paragraph',
    text: 'The Islamic scholarly tradition is vast. It spans over fourteen centuries, countless regions, and dozens of disciplines. From the careful preservation of prophetic traditions to the systematic study of jurisprudence, from theological reflection to the cultivation of the inner life, this tradition represents one of the great intellectual endeavors of human civilization.',
  },
  {
    type: 'quote',
    text: 'The seeking of knowledge is an obligation upon every Muslim.',
    attribution: 'A well-known prophetic tradition',
  },
  {
    type: 'paragraph',
    text: 'This book does not attempt to replace the primary sources or the detailed works of the scholars. Rather, it aims to provide a map — a way of understanding the landscape of Islamic scholarship so that the reader can navigate it with greater confidence. Each chapter introduces a major theme, and each section within it develops a specific aspect of that theme.',
  },
  {
    type: 'paragraph',
    text: 'The reader is encouraged to approach this work not as a final authority but as a starting point. The true study of any discipline requires returning to the sources, consulting qualified teachers, and engaging with the subject matter over time. What follows is an invitation to that longer journey.',
  },
  {
    type: 'heading',
    text: 'How This Book Is Organized',
  },
  {
    type: 'paragraph',
    text: 'The book is divided into five chapters. The first establishes the foundations — the sources, methods, and historical context that gave shape to the Islamic sciences. The second examines the core principles that guide scholarly inquiry. The third considers how those principles are applied in practice. The fourth offers reflections on the state of scholarship today, and the fifth provides a brief conclusion.',
  },
  {
    type: 'paragraph',
    text: 'Throughout, an effort has been made to present ideas clearly and fairly. Where there are differences of opinion — and in a living tradition, there always are — the aim has been to represent the major positions without premature judgment. The reader should consult the referenced works for fuller treatment of any topic.',
  },
];

const makeFoundations = (): BookSection[] => [
  {
    id: 'sec-1-1',
    number: '1.1',
    title: 'Background',
    content: [
      {
        type: 'paragraph',
        text: 'The Islamic intellectual tradition did not emerge in a vacuum. It arose within a specific historical, linguistic, and social context, and it was shaped by the challenges and opportunities of that context. Understanding the background of this tradition is essential to appreciating both its character and its development.',
      },
      {
        type: 'paragraph',
        text: 'The revelation of the Qur’an began in the early seventh century CE in the Arabian city of Mecca. Over a period of approximately twenty-three years, verses were revealed to the Prophet Muhammad ﷺ in response to circumstances, questions, and events. This process of gradual revelation meant that the early community engaged with the text in a dynamic, lived context — not as an abstract document but as guidance addressing real situations.',
      },
      {
        type: 'paragraph',
        text: 'After the Prophet’s death, the community faced the task of preserving, understanding, and applying this guidance in new and evolving circumstances. This task gave rise to a range of scholarly disciplines, each with its own methods, authorities, and literature. What united them was a shared commitment to fidelity to the primary sources — the Qur’an and the prophetic tradition — and to the responsible interpretation of those sources for the benefit of the community.',
      },
      {
        type: 'heading',
        text: 'The Role of the Arabic Language',
      },
      {
        type: 'paragraph',
        text: 'The Arabic language occupied a central place in the development of the Islamic sciences. Because the primary sources are in Arabic, mastery of the language — its grammar, rhetoric, and nuances — became a fundamental requirement for serious scholarship. Over time, specialized disciplines of Arabic linguistics developed to serve the needs of interpreters and jurists.',
      },
      {
        type: 'paragraph',
        text: 'This linguistic foundation meant that scholarship was, for many centuries, concentrated in regions where Arabic was the language of instruction and debate. However, the tradition also absorbed and engaged with intellectual currents from Persia, Greece, India, and elsewhere, producing a richly diverse scholarly culture.',
      },
    ],
  },
  {
    id: 'sec-1-2',
    number: '1.2',
    title: 'Definitions',
    content: [
      {
        type: 'paragraph',
        text: 'Before proceeding further, it is helpful to define several key terms that recur throughout this work. These definitions are introductory and not exhaustive; each term has been the subject of extensive scholarly literature.',
      },
      {
        type: 'heading',
        text: '‘Ilm (Knowledge)',
      },
      {
        type: 'paragraph',
        text: 'The Arabic word ‘ilm, typically translated as “knowledge,” carries a broader and deeper meaning than its English counterpart. In the Islamic scholarly context, ‘ilm is not merely information but a moral and spiritual category. The pursuit of knowledge is understood as a form of worship, and the scholar holds a respected place in the community.',
      },
      {
        type: 'quote',
        text: 'Scholars are the heirs of the prophets.',
        attribution: 'A well-known prophetic tradition',
      },
      {
        type: 'heading',
        text: 'Fiqh (Jurisprudence)',
      },
      {
        type: 'paragraph',
        text: 'Fiqh refers to the human understanding and application of Islamic law. It is the disciplined process of deriving legal rulings from the primary sources and applying them to specific cases. The term is sometimes used loosely to mean “Islamic law,” but technically it refers to the scholarly activity of legal reasoning, not the divine law itself.',
      },
      {
        type: 'heading',
        text: 'Usul (Principles / Roots)',
      },
      {
        type: 'paragraph',
        text: 'The word usul, meaning “roots” or “foundations,” refers to the principles and methodologies that underlie a given discipline. Usul al-fiqh, for example, is the science of the sources and methods of jurisprudence — the rules that govern how legal rulings are derived.',
      },
      {
        type: 'list',
        items: [
          '‘Ilm — knowledge, understood as both information and moral practice.',
          'Fiqh — the scholarly discipline of deriving and applying legal rulings.',
          'Usul — the foundational principles and methodology of a science.',
          'Ijma‘ — scholarly consensus on a given matter.',
          'Qiyas — analogical reasoning from an established ruling to a new case.',
        ],
      },
    ],
  },
  {
    id: 'sec-1-3',
    number: '1.3',
    title: 'Historical Context',
    content: [
      {
        type: 'paragraph',
        text: 'The development of the Islamic sciences can be understood in broad historical phases, each marked by particular concerns and achievements. While any periodization is approximate, it provides a useful framework for orientation.',
      },
      {
        type: 'heading',
        text: 'The First Three Centuries',
      },
      {
        type: 'paragraph',
        text: 'The first three centuries of the Hijri calendar were a period of formation. The sayings and practices of the Prophet — the Hadith — were collected, verified, and organized. The major schools of jurisprudence took shape, and the foundations of theological discourse were laid. This era produced works of enduring authority that later scholars would build upon, comment on, and refine.',
      },
      {
        type: 'paragraph',
        text: 'Travel was a hallmark of this period. Scholars journeyed great distances to study with teachers, verify chains of transmission, and collect accounts. The isnad — the chain of narrators connecting a report to its source — became a defining feature of Islamic scholarship, ensuring a level of accountability and traceability unusual for its time.',
      },
      {
        type: 'heading',
        text: 'The Classical Period',
      },
      {
        type: 'paragraph',
        text: 'From roughly the fourth to the eighth century AH, the Islamic sciences reached a stage of maturity and systematization. Comprehensive reference works were composed in every discipline. The sciences of the Qur’an, the methodology of Hadith, the principles of jurisprudence, and the study of theology all developed sophisticated technical vocabularies and established methods.',
      },
      {
        type: 'paragraph',
        text: 'This period also saw the rise of institutions — madrasas, libraries, and endowments — that supported scholarship at scale. Cities such as Baghdad, Damascus, Cairo, and Cordoba became centers of learning where students and teachers from across the Islamic world gathered.',
      },
      {
        type: 'heading',
        text: 'The Post-Classical and Modern Periods',
      },
      {
        type: 'paragraph',
        text: 'From the ninth century onward, scholarship continued through commentary, super-commentary, and concise summaries designed for teaching. While some have characterized this as a period of decline, recent scholarship has shown that it was also a period of remarkable productivity and regional flourishing.',
      },
      {
        type: 'paragraph',
        text: 'The modern period, beginning roughly in the thirteenth century AH, brought new challenges. Colonialism, the rise of nation-states, and the encounter with modern European thought raised questions that earlier scholars had not faced. Contemporary Islamic scholarship continues to grapple with these questions while maintaining continuity with the classical tradition.',
      },
    ],
  },
];

const makePrinciples = (): BookSection[] => [
  {
    id: 'sec-2-1',
    number: '2.1',
    title: 'The Primacy of Revelation',
    content: [
      {
        type: 'paragraph',
        text: 'The first and most fundamental principle of Islamic scholarship is the primacy of revelation. The Qur’an and the prophetic tradition are the ultimate sources of guidance, and all scholarly activity is oriented toward understanding and applying them. This principle shapes every discipline, from jurisprudence to theology to ethics.',
      },
      {
        type: 'paragraph',
        text: 'This does not mean that reason is displaced. On the contrary, the tradition places great value on rational inquiry, systematic methodology, and intellectual rigor. But reason operates in service of understanding revelation, not as a rival authority. The relationship is complementary: revelation provides the framework, and reason works within it.',
      },
      {
        type: 'quote',
        text: 'Reflect deeply on the creation, but do not reflect on the Creator, for your mind cannot comprehend Him.',
        attribution: 'Attributed to early scholars',
      },
      {
        type: 'paragraph',
        text: 'The practical implication of this principle is that scholarly conclusions are always referred back to the primary sources. A legal ruling, a theological position, or an ethical teaching must be grounded in textual evidence or in a recognized method of derivation from such evidence. This grounding gives the tradition its continuity and coherence across time and place.',
      },
    ],
  },
  {
    id: 'sec-2-2',
    number: '2.2',
    title: 'The Preservation of Transmission',
    content: [
      {
        type: 'paragraph',
        text: 'The second principle is the preservation of transmission. Knowledge is not merely discovered; it is received from those who came before and passed on to those who follow. This principle is most visible in the science of Hadith, where chains of narration are scrutinized with extraordinary care, but it extends to every discipline.',
      },
      {
        type: 'paragraph',
        text: 'A student does not simply read a book; the student studies with a teacher, who studied with a teacher, in a chain that ideally reaches back to the original source. This personal transmission ensures that knowledge is not just information but a living practice, shaped by the relationship between teacher and student.',
      },
      {
        type: 'paragraph',
        text: 'The ijaza — a formal authorization granted by a teacher to a student — represents this principle in institutional form. It certifies not only that the student has studied the material but that the student is qualified to teach it. This system preserved the integrity of the tradition across many generations.',
      },
      {
        type: 'list',
        items: [
          'Knowledge is transmitted person to person, not merely through texts.',
          'The chain of transmission (isnad) connects the present student to the original source.',
          'The ijaza authorizes a student to teach, ensuring continuity of scholarship.',
          'Personal study with a teacher remains the ideal, even when written works are available.',
        ],
      },
    ],
  },
  {
    id: 'sec-2-3',
    number: '2.3',
    title: 'The Principle of Scholarly Consensus',
    content: [
      {
        type: 'paragraph',
        text: 'The third principle is the authority of scholarly consensus, known as ijma‘. When the qualified scholars of a generation agree upon a matter, that agreement constitutes a binding authority that cannot be overturned by later individual opinion. This principle provides stability to the tradition and prevents excessive fragmentation.',
      },
      {
        type: 'paragraph',
        text: 'The scope and nature of consensus has been debated among scholars. Some limit it to the companions of the Prophet; others extend it to the qualified scholars of any generation. What is generally agreed upon is that consensus, where it can be established, carries decisive weight in legal and theological reasoning.',
      },
      {
        type: 'paragraph',
        text: 'In practice, establishing consensus is difficult. Scholars have developed criteria for determining when consensus has occurred and for distinguishing genuine consensus from the mere prevalence of a view. This attention to method reflects the tradition’s concern for precision and accountability.',
      },
      {
        type: 'paragraph',
        text: 'Consensus operates alongside the other sources of law — the Qur’an, the Sunnah, and analogical reasoning — as one of the four primary roots of jurisprudence (usul al-fiqh). Together, these four sources form the methodological foundation upon which the edifice of Islamic legal reasoning is built.',
      },
    ],
    subsections: [
      {
        id: 'sec-2-3-1',
        number: '2.3.1',
        title: 'The Nature of Binding Consensus',
        content: [
          {
            type: 'paragraph',
            text: 'Not every agreement among scholars rises to the level of binding consensus. For consensus to be authoritative, it must meet certain conditions. The scholars who participate must be qualified; their agreement must be on a matter within the scope of scholarly judgment; and the agreement must be clear and well-established.',
          },
          {
            type: 'paragraph',
            text: 'Some scholars argued that consensus is only binding when it includes the companions of the Prophet. Others held that the consensus of qualified scholars in any generation is authoritative. This difference of opinion itself illustrates the tradition’s willingness to engage in reasoned debate about its own foundations.',
          },
        ],
      },
      {
        id: 'sec-2-3-2',
        number: '2.3.2',
        title: 'Dissent and Plurality Within Consensus',
        content: [
          {
            type: 'paragraph',
            text: 'It is important to note that the principle of consensus does not eliminate disagreement. The Islamic scholarly tradition has always accommodated a range of legitimate positions on many issues. Where consensus exists, it is respected; where it does not, scholars may hold different views, each grounded in the recognized methods of derivation.',
          },
          {
            type: 'paragraph',
            text: 'This acceptance of plurality within a shared methodological framework is one of the tradition’s distinctive features. It allows for adaptation to different circumstances while maintaining coherence. The recognition that qualified scholars may reach different conclusions on matters of interpretation is not seen as a weakness but as a form of divine mercy, according to a well-known prophetic tradition.',
          },
          {
            type: 'quote',
            text: 'Difference of opinion in my community is a mercy.',
            attribution: 'A tradition cited in discussions of legal plurality',
          },
        ],
      },
    ],
  },
];

const makeApplications = (): BookSection[] => [
  {
    id: 'sec-3-1',
    number: '3.1',
    title: 'Application in Jurisprudence',
    content: [
      {
        type: 'paragraph',
        text: 'The principles outlined in the previous chapter find their most developed application in the science of jurisprudence (fiqh). Jurisprudence is the disciplined process of deriving legal rulings from the primary sources and applying them to the concrete situations of human life. It is perhaps the most extensively developed of the Islamic sciences.',
      },
      {
        type: 'paragraph',
        text: 'A jurist (faqih) approaches a question by first examining the primary sources — the Qur’an and the Sunnah — for relevant texts. If a clear text addresses the matter, the jurist derives the ruling from it. If no direct text is found, the jurist turns to consensus and analogical reasoning, and in some schools to other supplementary sources such as public interest (maslaha) or customary practice (‘urf).',
      },
      {
        type: 'paragraph',
        text: 'This process is not arbitrary. It is governed by the science of usul al-fiqh — the principles of jurisprudence — which specifies how each source is to be used, how conflicts between texts are to be resolved, and how analogical reasoning is to be conducted. A ruling that does not follow the established methods is not considered valid, regardless of the prominence of the person issuing it.',
      },
      {
        type: 'heading',
        text: 'The Major Schools of Law',
      },
      {
        type: 'paragraph',
        text: 'Over time, several distinct schools of jurisprudence (madhhabs) emerged, each named after a founding jurist and characterized by particular methodological emphases. The four major Sunni schools — the Hanafi, Maliki, Shafi‘i, and Hanbali — developed sophisticated bodies of law that continue to be followed by Muslims around the world.',
      },
      {
        type: 'paragraph',
        text: 'While the schools differ on many specific rulings, they share the same foundational sources and methods. Their differences typically arise from different assessments of the evidence or different judgments about the weight of competing considerations. This diversity reflects the complexity of the sources and the sincerity of scholarly engagement with them.',
      },
    ],
  },
  {
    id: 'sec-3-2',
    number: '3.2',
    title: 'Application in Theology',
    content: [
      {
        type: 'paragraph',
        text: 'The principles of Islamic scholarship also find application in theology (‘aqeedah) — the disciplined study of beliefs and doctrines. Theological inquiry in the Islamic tradition seeks to articulate the content of faith in a way that is faithful to revelation, coherent in itself, and responsive to the questions that arise in each generation.',
      },
      {
        type: 'paragraph',
        text: 'The central doctrines of Islamic theology — the oneness of God, the reality of prophethood, the truth of revelation, and the reality of the afterlife — are grounded in the primary sources. Theological scholarship develops the implications of these doctrines, addresses objections, and refutes misunderstandings.',
      },
      {
        type: 'paragraph',
        text: 'Different approaches to theology have existed within the tradition. Some scholars emphasized a strict adherence to the text without extensive rational elaboration. Others developed systematic theological frameworks using tools drawn from philosophy and logic. These approaches represent different judgments about the best way to articulate and defend the faith, and they coexist within the broader tradition.',
      },
      {
        type: 'paragraph',
        text: 'What unites them is the conviction that theological reflection must remain grounded in revelation and must serve the goal of right belief and right worship. Theology is not an exercise in abstract speculation but a discipline oriented toward knowing God and living in accordance with that knowledge.',
      },
    ],
  },
];

const makeReflections = (): BookSection[] => [
  {
    id: 'sec-4-1',
    number: '4.1',
    title: 'Scholarship in a Changing World',
    content: [
      {
        type: 'paragraph',
        text: 'The Islamic scholarly tradition confronts a set of challenges in the contemporary period that are genuinely new. The rise of modern nation-states, the transformation of education systems, the spread of print and digital media, and the encounter with secular modernity have all reshaped the conditions under which scholarship is practiced.',
      },
      {
        type: 'paragraph',
        text: 'In the past, scholarship was concentrated in institutions — madrasas, mosques, and libraries — supported by endowments and governed by established curricula. Today, while these institutions persist in many places, scholarship also occurs in universities, online platforms, and informal study circles. The range of voices participating in scholarly discourse has expanded considerably.',
      },
      {
        type: 'paragraph',
        text: 'This expansion brings both opportunities and risks. On the one hand, more people than ever before have access to the sources and to scholarly discussion. On the other hand, the loss of traditional structures of training and authorization can lead to a flattening of expertise, where the distinction between rigorous scholarship and casual opinion becomes blurred.',
      },
      {
        type: 'paragraph',
        text: 'The challenge for the contemporary tradition is to preserve the depth and discipline of classical scholarship while engaging seriously with the conditions of modern life. This requires both continuity and renewal — fidelity to the sources and methods that have defined the tradition, and thoughtful adaptation to new contexts and questions.',
      },
    ],
  },
  {
    id: 'sec-4-2',
    number: '4.2',
    title: 'The Unity of Knowledge and Conduct',
    content: [
      {
        type: 'paragraph',
        text: 'A recurring theme throughout this work has been the unity of knowledge and conduct in the Islamic scholarly tradition. Knowledge is not pursued for its own sake alone but for the transformation it brings to the knower and to the community. The scholar is not merely an expert but a model of the knowledge he or she carries.',
      },
      {
        type: 'paragraph',
        text: 'This unity has practical implications. It means that the study of any discipline should be accompanied by attention to one’s character and spiritual state. It means that scholarly disagreement should be conducted with adab — with courtesy and respect. And it means that the goal of education is not the accumulation of information but the formation of a person capable of living and transmitting the tradition.',
      },
      {
        type: 'quote',
        text: 'Knowledge without action is like a tree without fruit.',
        attribution: 'A saying attributed to early scholars',
      },
      {
        type: 'paragraph',
        text: 'This vision of knowledge as a moral and spiritual practice is one of the tradition’s most distinctive contributions. In an age that tends to value knowledge primarily for its practical utility, the Islamic scholarly tradition reminds us that the deepest purpose of learning is the cultivation of wisdom, virtue, and right relationship with God and with creation.',
      },
    ],
  },
];

const conclusionSections: BookSection[] = [
  {
    id: 'sec-5-1',
    number: '5.1',
    title: 'Summary',
    content: [
      {
        type: 'paragraph',
        text: 'This work has offered an introductory overview of the Islamic intellectual tradition. We began with the foundations — the sources, definitions, and historical context that gave shape to the Islamic sciences. We then examined the core principles: the primacy of revelation, the preservation of transmission, and the authority of consensus. We considered how these principles are applied in jurisprudence and theology. Finally, we reflected on the state of scholarship in the contemporary world and on the unity of knowledge and conduct.',
      },
      {
        type: 'paragraph',
        text: 'The picture that emerges is of a tradition remarkable for its depth, its coherence, and its adaptability. Over fourteen centuries, in vastly different circumstances, scholars have engaged with the same primary sources using shared methods, producing a body of knowledge that is both unified and diverse. This is a legacy worth studying, worth preserving, and worth carrying forward.',
      },
    ],
  },
  {
    id: 'sec-5-2',
    number: '5.2',
    title: 'A Note to the Reader',
    content: [
      {
        type: 'paragraph',
        text: 'If this book has served its purpose, the reader will not end here but will be inspired to continue the journey — to read the primary sources, to study with qualified teachers, and to engage with the tradition in a sustained and serious way. The following references provide a starting point for further reading.',
      },
      {
        type: 'paragraph',
        text: 'The study of the Islamic scholarly tradition is a lifelong endeavor. It rewards patience, humility, and consistency. May this modest introduction be of benefit to those who undertake it.',
      },
      {
        type: 'reference',
        text: 'This work is a demo/sample publication created to demonstrate the structured reading experience of the Islamic Digital Library platform. It is not a historical source and should not be cited as such.',
        source: 'Editorial note',
      },
    ],
  },
];

export { intro as sampleIntroduction };

export const sampleBookChapters = [
  {
    id: 'ch-1',
    number: '1',
    title: 'Foundations',
    description: 'The sources, methods, and historical context that shaped the Islamic sciences.',
    sections: makeFoundations(),
  },
  {
    id: 'ch-2',
    number: '2',
    title: 'Principles',
    description: 'The core principles that guide scholarly inquiry in the Islamic tradition.',
    sections: makePrinciples(),
  },
  {
    id: 'ch-3',
    number: '3',
    title: 'Applications',
    description: 'How the principles of the tradition are applied in jurisprudence and theology.',
    sections: makeApplications(),
  },
  {
    id: 'ch-4',
    number: '4',
    title: 'Reflections',
    description: 'Contemporary challenges and the unity of knowledge and conduct.',
    sections: makeReflections(),
  },
  {
    id: 'ch-5',
    number: '5',
    title: 'Conclusion',
    description: 'A summary and a note to the reader.',
    sections: conclusionSections,
  },
] as const;
