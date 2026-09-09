import type { Text } from "../core/types";
export interface Lesson {
  title: Text;
  body: Text;
  question: Text;
  options: Text[];
  answer: number;
  feedback: Text;
  experiment?: "context" | "usage" | "privacy";
}
export const lessons: Lesson[] = [
  {
    title: ["The workload", "İş yükü"],
    body: [
      "Start with model, tokens and demand. “Run a 70B model” omits the workload that surrounds it.",
      "Model, token ve taleple başlayın. “70B model çalıştırmak”, çevresindeki iş yükünü tanımlamaz.",
    ],
    question: [
      "Which input is needed beyond model size?",
      "Model boyutunun yanında hangi girdi gerekir?",
    ],
    options: [
      ["Concurrent requests and context", "Eşzamanlı istek ve bağlam"],
      ["The most popular hardware brand", "En popüler donanım markası"],
    ],
    answer: 0,
    feedback: [
      "Peak demand and resident context determine how much runtime state must fit.",
      "Tepe talep ve bellekteki bağlam, sığması gereken çalışma durumu miktarını belirler.",
    ],
  },
  {
    title: ["Memory", "Bellek"],
    body: [
      "Q4 weight storage is an estimate. KV cache has its own precision and architecture dimensions.",
      "Q4 ağırlık depolaması bir tahmindir. KV önbelleğinin kendi hassasiyeti ve mimari boyutları vardır.",
    ],
    question: [
      "What happens when maximum context doubles?",
      "Azami bağlam ikiye katlanırsa ne olur?",
    ],
    options: [
      ["Weights double", "Ağırlıklar ikiye katlanır"],
      [
        "KV doubles in this full-attention approximation",
        "Bu tam dikkat yaklaşımında KV ikiye katlanır",
      ],
    ],
    answer: 1,
    feedback: [
      "Weights stay fixed. KV grows with resident tokens × sequences in this educational formula.",
      "Ağırlıklar sabit kalır. Bu eğitim formülünde KV, bellekteki token × dizi ile büyür.",
    ],
    experiment: "context",
  },
  {
    title: ["Demand", "Talep"],
    body: [
      "Average demand influences economics; peak simultaneous requests challenge capacity.",
      "Ortalama talep ekonomiyi, tepe eşzamanlı istekler kapasiteyi etkiler.",
    ],
    question: [
      "Should a low average hide a high peak?",
      "Düşük ortalama yüksek tepeyi gizlemeli mi?",
    ],
    options: [
      ["Yes, average is enough", "Evet, ortalama yeterli"],
      [
        "No, size and test the peak separately",
        "Hayır, tepeyi ayrı boyutlandırın ve sınayın",
      ],
    ],
    answer: 1,
    feedback: [
      "A low monthly bill does not prove the burst can be served.",
      "Düşük aylık fatura, ani yükün karşılanabileceğini kanıtlamaz.",
    ],
  },
  {
    title: ["Latency", "Gecikme"],
    body: [
      "TTFT measures time to first token. Output rate describes ongoing generation. Memory fit verifies neither.",
      "TTFT ilk tokena kadar geçen süredir. Çıktı hızı süren üretimi tanımlar. Belleğe sığmak ikisini de doğrulamaz.",
    ],
    question: [
      "What should DCL show without measurements?",
      "DCL ölçüm yoksa ne göstermeli?",
    ],
    options: [
      [
        "Unknown, with a benchmark requirement",
        "Bilinmiyor ve ölçüm gereksinimi",
      ],
      [
        "A precise speed inferred from memory",
        "Bellekten türetilmiş kesin hız",
      ],
    ],
    answer: 0,
    feedback: [
      "Use TFL for the serving mental model and benchmark a real configuration for performance evidence.",
      "Servis kavramları için TFL’yi kullanın; performans kanıtı için gerçek yapılandırmayı ölçün.",
    ],
  },
  {
    title: ["Privacy", "Gizlilik"],
    body: [
      "Local-only processing is a boundary on where computation happens, not a score adjustment.",
      "Yalnızca yerel işleme, hesaplamanın nerede yapıldığına ilişkin bir sınırdır; puan ayarı değildir.",
    ],
    question: [
      "A very cheap API violates local-only. What happens?",
      "Çok ucuz API yerel-only kuralını ihlal ediyor. Ne olur?",
    ],
    options: [
      ["It stays recommended because it is cheap", "Ucuz olduğu için önerilir"],
      ["It becomes ineligible", "Uygun olmaktan çıkar"],
    ],
    answer: 1,
    feedback: [
      "A preference cannot override a hard constraint. These are educational rules, not legal classifications.",
      "Tercih kesin kısıtı geçersiz kılamaz. Bunlar hukuki sınıflandırma değil, eğitim kurallarıdır.",
    ],
    experiment: "privacy",
  },
  {
    title: ["Utilization", "Kullanım oranı"],
    body: [
      "The purchase remains even when hardware sits idle. Token charges scale with configured usage.",
      "Donanım boşta olsa da satın alma maliyeti kalır. Token ücretleri ayarlanan kullanımla ölçeklenir.",
    ],
    question: [
      "At 0% utilization, which cost remains?",
      "%0 kullanımda hangi maliyet kalır?",
    ],
    options: [
      ["Local purchase cost", "Yerel satın alma maliyeti"],
      ["Token usage charge", "Token kullanım ücreti"],
    ],
    answer: 0,
    feedback: [
      "Idle power and provisioned cloud charges may also remain, depending on the on/off policy.",
      "Açık/kapalı politikasına göre boşta güç ve ayrılmış bulut ücretleri de kalabilir.",
    ],
    experiment: "usage",
  },
  {
    title: ["Cost", "Maliyet"],
    body: [
      "Compare cumulative cash outlay over the same horizon. State taxes, labor and residual value omissions.",
      "Aynı dönem boyunca birikimli nakit harcamasını karşılaştırın. Vergi, işçilik ve kalan değer dışlamalarını belirtin.",
    ],
    question: [
      "Must ownership eventually break even?",
      "Sahiplik mutlaka bir gün başa başa gelir mi?",
    ],
    options: [
      ["No, the curves may never cross", "Hayır, eğriler hiç kesişmeyebilir"],
      ["Yes, always after three years", "Evet, her zaman üç yıl sonra"],
    ],
    answer: 0,
    feedback: [
      "Break-even exists only when the computed curves actually cross within the horizon.",
      "Başa baş yalnızca hesaplanan eğriler dönem içinde gerçekten kesişirse vardır.",
    ],
  },
  {
    title: ["Scale", "Ölçek"],
    body: [
      "A fixed node has a finite pool. Rented services still have quotas, configuration work and recurring cost.",
      "Sabit düğümün havuzu sınırlıdır. Kiralık servislerin de kotaları, yapılandırma işi ve tekrarlayan maliyeti vardır.",
    ],
    question: [
      "Can a cloud VM scale infinitely in DCL?",
      "DCL’de bir bulut VM sonsuz ölçeklenebilir mi?",
    ],
    options: [
      ["Yes, cloud is infinite", "Evet, bulut sonsuzdur"],
      [
        "No, its current allocation has a ceiling",
        "Hayır, mevcut tahsisin sınırı vardır",
      ],
    ],
    answer: 1,
    feedback: [
      "The Scale view stresses the current configuration. Expansion is a new architecture decision.",
      "Ölçek ekranı mevcut yapılandırmayı sınar. Genişleme yeni bir mimari karardır.",
    ],
  },
  {
    title: ["Operations", "İşletim"],
    body: [
      "Managed inference operates a dedicated endpoint. Token APIs expose a provider model contract. Neither is the same as a self-operated VM.",
      "Yönetilen çıkarım ayrılmış uç nokta işletir. Token API sağlayıcının model sözleşmesini sunar. İkisi de kendinizin işlettiği VM ile aynı değildir.",
    ],
    question: [
      "Does zero maintenance reserve mean no operations work?",
      "Sıfır bakım payı işletim işi yok demek midir?",
    ],
    options: [
      [
        "No, it is an omitted cost assumption",
        "Hayır, bu dışlanan maliyet varsayımıdır",
      ],
      ["Yes, operation is free", "Evet, işletim ücretsizdir"],
    ],
    answer: 0,
    feedback: [
      "Model the costs you know. Make missing costs and operator responsibilities visible.",
      "Bildiğiniz maliyetleri modelleyin. Eksik maliyetleri ve operatör sorumluluklarını görünür tutun.",
    ],
  },
  {
    title: ["Decision", "Karar"],
    body: [
      "There is no best deployment. There is a better fit for a specific workload, within the quality of available evidence.",
      "En iyi dağıtım yoktur. Mevcut kanıtın kalitesi dahilinde belirli iş yüküne daha uygun bir seçenek vardır.",
    ],
    question: [
      "What does the highest weighted score establish?",
      "En yüksek ağırlıklı puan neyi gösterir?",
    ],
    options: [
      ["A universal vendor winner", "Evrensel bir üretici kazananı"],
      [
        "A conditional preference under these inputs",
        "Bu girdiler altında koşullu bir tercih",
      ],
    ],
    answer: 1,
    feedback: [
      "Inspect failed constraints, cost assumptions and unknown performance before accepting a recommendation.",
      "Öneriyi kabul etmeden önce geçilemeyen kısıtları, maliyet varsayımlarını ve bilinmeyen performansı inceleyin.",
    ],
  },
];
