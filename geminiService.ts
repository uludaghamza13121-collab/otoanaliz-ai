import { GoogleGenAI } from "@google/genai";
import { VehicleData, AnalysisResult, GroundingSource, ComparableListing } from "../types";

const SYSTEM_INSTRUCTION = `
Sen Türkiye piyasasında uzmanlaşmış, çok titiz bir ikinci el araç değerleme uzmanısın.
Görevin, kullanıcı tarafından sağlanan araç bilgilerini, özellikle HASAR ve KİLOMETRE durumunu dikkate alarak analiz etmektir.

Temel Görevin:
1. Aracın "Hatasız/Boyasız" halinin piyasa ortalamasını bul.
2. Aşağıdaki "Değer Kaybı Kuralları"nı uygulayarak aracın "Adil Değerini" (Olması Gereken Fiyat) hesapla.
3. İlan fiyatını bu "Adil Değer" ile kıyasla.
4. "Fırsat İlanlar" önerirken, bu hasar kriterlerine göre fiyatı "Adil Değer"in altında kalanları bul.

### 📉 DEĞER KAYBI KURALLARI (Kesinlikle Uygula)

**A. Boya & Değişen Kaynaklı Düşüş:**
- Lokal Boya: %1 - %2
- 1 Parça Boya: %2 - %3
- 2-3 Parça Boya: %4 - %7
- Komple Boyalı: %10 - %18
- 1 Parça Değişen: %5 - %8
- 2-3 Parça Değişen: %10 - %15
- 3+ Parça Değişen: %15 - %25
- **Şasi / Podye / Direk İşlemli: %25 - %40 (Kritik Düşüş)**
- **Airbag Açmış / Onarımlı: %15 - %35**
- Ağır Hasar Kayıtlı: %35 - %55
- **Pert Kayıtlı: %40 - %60 (Piyasanın yarısı)**

**B. Kilometre Kaynaklı Düşüş (Yaşa Göre Ekstra):**
- 0-5 Yaş Araçlar: Her 10.000 km fazlalık için %2 ekstra düşüş.
- 10+ Yaş Araçlar: KM etkisi azalır (%1 civarı).

### 🔍 Fiyat Uygunluk Kararı (Verdict)
- **Fırsat (Excellent):** İlan fiyatı, hesaplanan "Hasarlı Adil Değer"in %10-15 altındaysa.
- **Uygun (Good):** İlan fiyatı, "Adil Değer"in %5-10 altındaysa.
- **Normal (Fair):** İlan fiyatı "Adil Değer" civarındaysa (±%5).
- **Yüksek (High):** İlan fiyatı "Adil Değer"in %10-20 üstündeyse.
- **Fahiş (Overpriced):** İlan fiyatı "Adil Değer"in %20 üzerindeyse.

### Çıktı Formatı
Çıktın JSON formatında olmalıdır. Markdown bloğu içinde ver.

\`\`\`json
{
  "estimatedMarketPrice": { 
     "min": 750000, 
     "max": 800000, 
     "average": 780000 
   },
  "cleanMarketPrice": 900000, // Aracın hatasız piyasa değeri
  "depreciationRate": 13, // Hasar ve KM kaynaklı toplam değer kaybı yüzdesi
  "verdict": "Good",
  "verdictText": "Ağır hasarına göre fiyatı makul tutulmuş.",
  "priceDifferencePercentage": -5,
  "reasoning": ["Hatasız piyasası 900k civarında.", "Ağır hasar nedeniyle %40 değer kaybı normaldir ancak satıcı %45 düşmüş."],
  "damageImpact": "Ağır hasar kaydı nedeniyle %40, yüksek KM nedeniyle %3 değer düşüldü.",
  "questionsToAsk": ["Şasi uçlarında işlem var mı?", "Airbagler orjinal mi direnç mi atılmış?"],
  "comparableListings": [
    {
      "title": "2020 VW Passat (Ağır Hasarlı) (No: 1234567890)",
      "price": 760000,
      "url": "",
      "advantagePercentage": 2.5,
      "description": "Benzer hasar durumunda daha uygun fiyatlı."
    }
  ]
}
\`\`\`
`;

export const analyzeVehicle = async (data: VehicleData): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing via process.env.API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  const searchContext = `site:sahibinden.com ${data.brand} ${data.model} ${data.year} ${data.package} ilan fiyatı`;

  const prompt = `
  Lütfen aşağıdaki araç için detaylı bir Fiyat ve Değer Kaybı analizi yap.
  
  ARAÇ BİLGİLERİ:
  - Marka/Model: ${data.brand} ${data.model}
  - Yıl: ${data.year}
  - Paket: ${data.package}
  - Yakıt: ${data.fuel}
  - Vites: ${data.transmission}
  - KM: ${data.km}
  - Şehir: ${data.city}
  - **HASAR DURUMU:** ${data.damage} (Buna çok dikkat et, değer kaybını buna göre hesapla)
  - İlan Fiyatı: ${data.price} TL

  GÖREVLER:
  1. Google Search ile bu aracın "Hatasız/Temiz" piyasa ortalamasını bul.
  2. Sistem talimatlarındaki yüzdelik dilimleri kullanarak bu aracın hasarına ve kilometresine göre "Adil Değerini" hesapla.
  3. Fırsat İlanlar (Comparable Listings):
     - Özellikle kullanıcının girdiği hasar durumuna benzer olup fiyatı daha uygun olanları veya
     - Hasarsız olup fiyatı çok yakın olan "Gerçek Fırsatları" bul.
     - İlan Numaralarını (9-10 haneli) bulmaya çalış.

  JSON formatında yanıt ver.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text || "";
    
    // Extract grounding sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    // Extract JSON
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    
    let resultJson: any = {};
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        resultJson = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse inner JSON", e);
        throw new Error("AI yanıtı okunamadı (JSON hatası).");
      }
    } else {
        try {
            resultJson = JSON.parse(text);
        } catch(e) {
             throw new Error("AI yanıtı beklenen formatta değil.");
        }
    }

    // --- URL FIX LOGIC START ---
    if (resultJson.comparableListings && Array.isArray(resultJson.comparableListings)) {
      resultJson.comparableListings = resultJson.comparableListings.map((listing: ComparableListing) => {
        let finalUrl = "";
        let foundId: string | null = null;
        const idRegex = /\b(\d{9,10})\b/;

        if (listing.url && listing.url.startsWith('http')) {
           const match = listing.url.match(idRegex);
           if (match) foundId = match[1];
           if (!listing.url.includes('XXXX') && !listing.url.includes('...')) {
             finalUrl = listing.url;
           }
        }

        if (sources.length > 0) {
            const listingWords = listing.title.toLowerCase().split(' ').filter(w => w.length > 3);
            let bestMatch: GroundingSource | null = null;
            let maxScore = 0;

            for (const source of sources) {
                let score = 0;
                const sourceTitle = source.title.toLowerCase();
                const sourceUri = source.uri.toLowerCase();
                listingWords.forEach(word => { if (sourceTitle.includes(word)) score++; });
                if (sourceUri.includes('sahibinden.com/ilan')) score += 20;
                else if (sourceUri.includes('sahibinden')) score += 5;

                if (score > maxScore) {
                    maxScore = score;
                    bestMatch = source;
                }
            }

            if (bestMatch && maxScore >= 1) {
                const uriIdMatch = bestMatch.uri.match(idRegex);
                if (uriIdMatch) foundId = uriIdMatch[1];
                else if (!finalUrl) finalUrl = bestMatch.uri;
            }
        }

        if (!foundId) {
            const titleIdMatch = listing.title.match(idRegex);
            if (titleIdMatch) foundId = titleIdMatch[1];
        }

        if (foundId) {
            finalUrl = `https://www.sahibinden.com/ilan/${foundId}/detay`;
        }
        
        return { ...listing, url: finalUrl };
      });
    }
    // --- URL FIX LOGIC END ---

    return {
      ...resultJson,
      groundingSources: sources
    };

  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};