import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy-loaded Gemini client to prevent crash on startup if GEMINI_API_KEY is not defined yet
  let aiClient: GoogleGenAI | null = null;

  function getGeminiClient(): GoogleGenAI {
    if (!aiClient) {
      const key = process.env.GEMINI_API_KEY;
      if (!key) {
        throw new Error("A chave GEMINI_API_KEY não foi configurada. Configure-a no painel de Segredos (Secrets) do AI Studio.");
      }
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/search", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== "string" || query.trim() === "") {
        return res.status(400).json({ error: "A busca não pode ser vazia." });
      }

      const ai = getGeminiClient();

      const systemInstruction = `Você é um renomado erudito em Teologia Comparada, História das Religiões, Filosofia e Crítica Textual Bíblica.
Sua tarefa é analisar o versículo ou texto bíblico fornecido pelo usuário e produzir uma análise hermenêutica comparativa extremamente detalhada, respeitosa e academicamente rigorosa.
Você deve analisar o texto sob 5 perspectivas principais:
1. Católica (Tradição Patrística, Escolástica, Magistério, Catecismo, Concílio de Trento, Vaticano II).
2. Protestante Reformada (Visão magisterial tradicional, Luterana e Reformada histórica, foco em Sola Fide, Sola Scriptura, sacerdócio de todos os crentes).
3. Calvinista (Foco específico na soberania absoluta de Deus, predestinação, monergismo, graça irresistível, Confissão de Westminster e Sínodo de Dort).
4. Ortodoxa Oriental (Tradição Patrística grega/oriental, Teose - Deificação, Sinergismo misterioso, Tradição Litúrgica, hesicasmo, São Gregório Palamas, São João Crisóstomo).
5. Judaica (Compreensão a partir do Tanakh/Bíblia Hebraica, Talmud, Midrash, e comentadores clássicos como Rashi, Maimônides/Rambam, e Nachmânides/Ramban. Indique a visão do judaísmo sobre o texto original hebraico e o significado no contexto hebraico original).

Caso o texto fornecido seja do Novo Testamento, a perspectiva judaica deve analisar o texto sob a ótica histórica do Judaísmo do Segundo Templo (como os conceitos se conectam com as ideias judaicas da época) ou como a apologética e teologia judaica moderna respondem e interpretam essa passagem messiânica ou teológica cristã.

Além disso, forneça:
1. O texto literal do versículo ou passagem em português (com tradução fiel ao original grego, hebraico ou aramaico).
2. O contexto histórico detalhado (autoria, datação consensual, contexto político-cultural e público-alvo).
3. Uma síntese de convergências (onde as tradições concordam ou encontram paralelo).
4. Uma síntese de divergências (os principais pontos de conflito teológico, filosófico e hermenêutico).
5. A visão de historiadores seculares ou acadêmicos (crítica textual bíblica, contexto literário histórico, estudos de historiadores contemporâneos como Bart Ehrman, Geza Vermes, etc.).

O resultado deve ser estritamente em português e estruturado rigorosamente conforme o JSON Schema fornecido.`;

      const prompt = `Analise detalhadamente o seguinte texto bíblico ou versículo: "${query}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reference: { 
                type: Type.STRING, 
                description: "Formatação canônica da referência bíblica identificada (ex: Gênesis 1:1, João 1:1)" 
              },
              literalText: { 
                type: Type.STRING, 
                description: "O texto bíblico literal em português, fiel aos manuscritos originais." 
              },
              historicalContext: { 
                type: Type.STRING, 
                description: "Contexto histórico profundo: autoria, datação estimada, geografia, destinatários e tensões políticas/religiosas da época." 
              },
              perspectives: {
                type: Type.OBJECT,
                properties: {
                  catolica: {
                    type: Type.OBJECT,
                    properties: {
                      theologians: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "Teólogos, filósofos e historiadores proeminentes da tradição (ex: Agostinho de Hipona, Tomás de Aquino, Boaventura)." 
                      },
                      interpretation: { 
                        type: Type.STRING, 
                        description: "Interpretação detalhada e profunda sob a ótica da teologia católica, dogmas, sacramentos e a relação entre Escritura e Tradição." 
                      },
                      keyFocus: { 
                        type: Type.STRING, 
                        description: "O conceito central ou termo-chave da perspectiva (ex: Tradição Apostólica, Sacramentabilidade, Graça Cooperativa)." 
                      },
                      historicalEvolution: { 
                        type: Type.STRING, 
                        description: "Evolução do debate nesta tradição (ex: patrística, escolástica medieval, reações pós-Reforma no Concílio de Trento, desenvolvimentos contemporâneos no Vaticano II)." 
                      }
                    },
                    required: ["theologians", "interpretation", "keyFocus", "historicalEvolution"]
                  },
                  reforma: {
                    type: Type.OBJECT,
                    properties: {
                      theologians: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "Teólogos e reformadores proeminentes (ex: Martinho Lutero, Filipe Melâncton, Ulrico Zuínglio, teólogos luteranos e reformados tradicionais)." 
                      },
                      interpretation: { 
                        type: Type.STRING, 
                        description: "Interpretação detalhada sob a ótica do Protestantismo Reformado Magisterial tradicional, focando na justificação pela fé, autoridade das Escrituras e sacerdócio universal." 
                      },
                      keyFocus: { 
                        type: Type.STRING, 
                        description: "O conceito central ou termo-chave (ex: Sola Fide, Justificação Forense, Sola Scriptura)." 
                      },
                      historicalEvolution: { 
                        type: Type.STRING, 
                        description: "Evolução e desdobramentos luteranos e protestantes confessionais desde o século XVI até as correntes teológicas evangélicas modernas." 
                      }
                    },
                    required: ["theologians", "interpretation", "keyFocus", "historicalEvolution"]
                  },
                  calvinista: {
                    type: Type.OBJECT,
                    properties: {
                      theologians: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "Teólogos e pensadores calvinistas relevantes (ex: João Calvino, Theodore Beza, Charles Hodge, B.B. Warfield, R.C. Sproul)." 
                      },
                      interpretation: { 
                        type: Type.STRING, 
                        description: "Interpretação detalhada baseada na soberania absoluta de Deus, depravação total, eleição incondicional, alianças bíblicas (Teologia do Pacto) e graça monergista." 
                      },
                      keyFocus: { 
                        type: Type.STRING, 
                        description: "O conceito central ou termo-chave (ex: Monergismo, Soberania Divina, Teologia da Aliança, Graça Irresistível)." 
                      },
                      historicalEvolution: { 
                        type: Type.STRING, 
                        description: "Consolidação histórica por meio das decisões do Sínodo de Dort, Confissão de Fé de Westminster e a teologia sistemática reformada posterior." 
                      }
                    },
                    required: ["theologians", "interpretation", "keyFocus", "historicalEvolution"]
                  },
                  ortodoxa: {
                    type: Type.OBJECT,
                    properties: {
                      theologians: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "Santos Padres, teólogos e místicos ortodoxos (ex: Atanásio de Alexandria, Basílio Magno, Gregório Palamas, Vladimir Lossky)." 
                      },
                      interpretation: { 
                        type: Type.STRING, 
                        description: "Interpretação sob a ótica ortodoxa oriental, enfatizando a tradição dos Padres da Igreja, Teose (Theosis), união com as energias incriadas de Deus, liturgia e mistério apofático." 
                      },
                      keyFocus: { 
                        type: Type.STRING, 
                        description: "O conceito central ou termo-chave (ex: Theosis/Deificação, Teologia Apofática, Energias Divinas Incriadas)." 
                      },
                      historicalEvolution: { 
                        type: Type.STRING, 
                        description: "Desenvolvimento consolidado nos sete Concílios Ecumênicos, o cisma de 1054, as controvérsias hesicastas do século XIV e a teologia ortodoxa russa/grega moderna." 
                      }
                    },
                    required: ["theologians", "interpretation", "keyFocus", "historicalEvolution"]
                  },
                  judaica: {
                    type: Type.OBJECT,
                    properties: {
                      theologians: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "Rabis clássicos, comentadores medievais e filósofos (ex: Rashi, Maimônides/Rambam, Nachmânides/Ramban, Ibn Ezra, Filo de Alexandria)." 
                      },
                      interpretation: { 
                        type: Type.STRING, 
                        description: "Análise profunda a partir do contexto hebraico original (Tanakh). Para textos do Antigo Testamento, focar na análise do texto hebraico, Talmud, Midrash e comentários clássicos. Para o Novo Testamento, descrever como a teologia/história judaica do Segundo Templo ou a apologética rabínica moderna avalia e responde aos conceitos do texto." 
                      },
                      keyFocus: { 
                        type: Type.STRING, 
                        description: "O conceito central ou termo-chave (ex: Pardes, Aliança de Moisés, Torah Oral, Mitzvá, Midrash)." 
                      },
                      historicalEvolution: { 
                        type: Type.STRING, 
                        description: "Evolução do pensamento interpretativo judaico, desde a literatura pós-exílica, período rabínico do Talmud, filosofia medieval de Maimônides até as correntes moderna e contemporânea." 
                      }
                    },
                    required: ["theologians", "interpretation", "keyFocus", "historicalEvolution"]
                  }
                },
                required: ["catolica", "reforma", "calvinista", "ortodoxa", "judaica"]
              },
              convergence: { 
                type: Type.STRING, 
                description: "Síntese clara e analítica apontando os pontos de convergência, áreas de acordo moral, histórico ou teológico básico entre essa visões." 
              },
              divergence: { 
                type: Type.STRING, 
                description: "Análise aprofundada das divergências mais cruciais que separam essas frentes de interpretação no texto estudado." 
              },
              secularHistorianView: { 
                type: Type.STRING, 
                description: "A perspectiva acadêmica e da crítica histórica secular sobre a autoria real, fontes literárias (como as fontes JEDP ou o evangelho de Marcos e Q), interpolações e o significado puramente histórico-literário do texto." 
              }
            },
            required: [
              "reference", 
              "literalText", 
              "historicalContext", 
              "perspectives", 
              "convergence", 
              "divergence", 
              "secularHistorianView"
            ]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      res.json(data);

    } catch (error: any) {
      console.error("Erro na busca hermenêutica:", error);
      res.status(500).json({ 
        error: error.message || "Erro desconhecido ao processar a requisição." 
      });
    }
  });

  // Configure Vite or serve production files
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Rodando na porta ${PORT} em modo ${process.env.NODE_ENV || 'desenvolvimento'}`);
  });
}

startServer();
