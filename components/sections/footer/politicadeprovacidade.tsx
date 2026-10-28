"use client";

import { useState, useEffect } from "react";
import { X, Shield, Lock, UserCheck, Database, Mail, MapPin, Phone, FileText, Eye, Share2, ShieldHalf, NotepadText, Book, ContactIcon } from "lucide-react";

export default function PrivacyPolicyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    // Delay para animação de entrada
    setTimeout(() => setIsVisible(true), 10);
  };

  const closeModal = () => {
    setIsVisible(false);
    // Delay para permitir a animação de saída antes de fechar
    setTimeout(() => setIsOpen(false), 300);
  };

  // Fechar modal com a tecla ESC
  useEffect(() => {
    const handleEsc = (e: { keyCode: number; }) => {
      if (e.keyCode === 27) closeModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      {/* Link no footer que abre o modal */}
      <button 
        onClick={openModal} 
        className="text-gray-500 hover:text-white text-sm transition-colors duration-300 hover:underline underline-offset-2"
      >
        Política e Privacidade
      </button>

      {/* Modal */}
      {isOpen && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black transition-opacity duration-300 ${
            isVisible ? "bg-opacity-40" : "bg-opacity-0"
          }`}
          onClick={closeModal}
        >
          <div 
            className={`relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
              isVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do modal */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Política de Privacidade</h2>
                  <p className="text-sm text-gray-600 mt-1">PROMET - Programa de Melhoria de Empregabilidade e Trabalho</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo da política de privacidade */}
            <div className="p-6 text-gray-700 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="prose max-w-none">
                {/* Cabeçalho informativo */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">
                        Última atualização: 02 de outubro de 2025
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Unitec Moçambique, Lda. • NUIT: 401522050
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-blue-600">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium">Documento Oficial</span>
                    </div>
                  </div>
                </div>

                {/* Introdução */}
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mt-0 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-500" />
                    Introdução
                  </h3>
                  <p className="text-gray-600">
                    O <strong>PROMET – Programa de Melhoria de Empregabilidade e Trabalho</strong>, 
                    gerido pela Unitec Moçambique, Lda. está comprometido 
                    com a proteção e o respeito pela sua privacidade. Esta Política de Privacidade 
                    explica como coletamos, usamos, divulgamos e protegemos as suas informações 
                    pessoais quando você participa no nosso programa, acede ao nosso site{" "}
                    <strong>www.promet.unitec.ac.mz</strong> ou interage connosco.
                  </p>
                  <p className="text-gray-600 mt-3 font-medium">
                    Ao inscrever-se no PROMET ou utilizar os nossos serviços, você concorda com os 
                    termos desta Política de Privacidade.
                  </p>
                </div>

                {/* 1. Que Informações Coletamos? */}
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mt-0 mb-3 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-blue-500" />
                    1. Que Informações Coletamos?
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Coletamos as informações que você nos fornece diretamente, incluindo, 
                    mas não se limitando a:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-2">
                    <li><strong>Dados de identificação</strong> (nome, data de nascimento, documentos)</li>
                    <li><strong>Informações de contacto</strong> (email, número de telefone, endereço)</li>
                    <li><strong>Dados académicos e profissionais</strong> (histórico educacional, currículo)</li>
                    <li><strong>Documentos carregados no seu perfil</strong> (como certificados ou declarações de frequência)</li>
                    <li><strong>Dados de pagamento</strong> (comprovativos de transferência)</li>
                    <li><strong>Resultados de avaliações</strong> (como o Teste de Diagnóstico)</li>
                  </ul>
                </div>

                {/* 2. Como Utilizamos as Suas Informações? */}
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mt-0 mb-3 flex items-center">
                    <UserCheck className="w-5 h-5 mr-2 text-blue-500" />
                    2. Como Utilizamos as Suas Informações?
                  </h3>
                  <p className="text-gray-600 mb-3">
                    Utilizamos os seus dados pessoais para os seguintes fins:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-2">
                    <li>Gerir a sua inscrição e participação no PROMET</li>
                    <li>Processar pagamentos de taxas (ex: taxa de teste, taxa de formação)</li>
                    <li>Fornecer os serviços do programa, incluindo formação, workshops e emissão de certificados</li>
                    <li>Facilitar o encaminhamento para estágios e oportunidades de emprego com <strong>empresas parceiras</strong></li>
                    <li>Comunicar consigo sobre atualizações do programa, eventos ou oportunidades relevantes</li>
                    <li>Garantir a segurança e o bom funcionamento do programa</li>
                  </ul>
                </div>

                {/* 3. Partilha de Dados com Terceiros */}
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mt-0 mb-3 flex items-center">
                    <Share2 className="w-5 h-5 mr-2 text-blue-500" />
                    3. Partilha de Dados com Terceiros
                  </h3>
                  <p className="text-gray-600 mb-3 font-medium">
                    O seu dados pessoais <strong>não serão partilhados com empresas não parceiras</strong>.
                  </p>
                  <p className="text-gray-600 mb-3">
                    Podemos partilhar as suas informações apenas nas seguintes situações:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-2">
                    <li>
                      Com <strong>empresas parceiras</strong> do PROMET para fins de recrutamento e 
                      seleção de estágios e empregos, conforme explicitado no regulamento.
                    </li>
                    <li>
                      Com prestadores de serviços que nos auxiliam na operação do programa 
                      (ex: plataforma de pagamentos), sujeitos a obrigações de confidencialidade.
                    </li>
                    <li>Se exigido por lei ou para proteger os nossos direitos legais.</li>
                  </ul>
                </div>

                {/* 4. Uso de Imagem */}
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mt-0 mb-3 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-500" />
                    4. Uso de Imagem
                  </h3>
                  <p className="text-gray-600">
                    Ao participar no PROMET, você <strong>autoriza expressamente</strong> a Unitec a 
                    utilizar a sua imagem (fotografias, vídeos) em materiais de divulgação do programa, 
                    tanto online como offline, sem direito a qualquer remuneração.
                  </p>
                </div>

                {/* 5. Segurança dos Seus Dados */}
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mt-0 mb-3 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-blue-500" />
                    5. Segurança dos Seus Dados
                  </h3>
                  <p className="text-gray-600">
                    Implementamos medidas técnicas e organizativas adequadas para proteger os seus 
                    dados pessoais contra acesso, uso ou divulgação não autorizados. Os seus dados 
                    serão tratados com a confidencialidade devida.
                  </p>
                </div>

                {/* 6. Os Seus Direitos */}
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mt-0 mb-3 flex items-center">
                  <Book className="w-5 h-5 mr-2 text-blue-500" />
                    6. Os Seus Direitos
                    </h3>
                  <p className="text-gray-600 mb-3 flex items-center">
                    Você tem o direito de:
                  </p>
                  <ul className="list-disc pl-5 mt-2 text-gray-600 space-y-2">
                    <li>Aceder e retificar os seus dados pessoais</li>
                    <li>
                      Solicitar a eliminação dos seus dados, sujeito a obrigações legais ou 
                      contratuais que nos impeçam de o fazer
                    </li>
                    <li>Opor-se ao tratamento dos seus dados para determinados fins</li>
                  </ul>
                  <p className="text-gray-600 mt-3 text-sm">
                    Para exercer estes direitos, contacte-nos através dos canais indicados no final desta política.
                  </p>
                </div>

                {/* 7. Conservação dos Dados */}
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mt-0 mb-3 flex items-center">
                  <ShieldHalf className="w-5 h-5 mr-2 text-blue-500" />
                  7. Conservação dos Dados
                  </h3>
                  <p className="text-gray-600">
                    Conservaremos os seus dados pessoais durante o período necessário para cumprir 
                    os fins descritos nesta política, incluindo para fins de manutenção da base de 
                    talentos e encaminhamento para novas oportunidades, tal como previsto no 
                    regulamento do PROMET.
                  </p>
                </div>

                {/* 8. Alterações a Esta Política */}
                <div className="mb-8 p-5 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold mt-0 mb-3 flex items-center">
                  <NotepadText className="w-5 h-5 mr-2 text-blue-500" />
                  8. Alterações a Esta Política
                  </h3>
                  <p className="text-gray-600">
                    Podemos atualizar esta Política de Privacidade periodicamente. Quaisquer 
                    alterações serão publicadas nesta página, com a data de atualização devidamente revista.
                  </p>
                </div>

                {/* 9. Contactos */}
                <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="text-lg font-semibold mt-0 mb-3 flex items-center text-blue-800">
                  <ContactIcon className="w-5 h-5 mr-2 text-blue-800" />
                  9. Contactos
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Se tiver alguma dúvida sobre esta Política de Privacidade ou o tratamento 
                    dos seus dados pessoais, entre em contacto connosco:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center text-blue-700">
                      <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                      <span>promet@unitec.ac.mz</span>
                    </div>
                    <div className="flex items-start text-blue-700">
                      <MapPin className="w-4 h-4 mr-3 mt-0.5 flex-shrink-0" />
                      <span>Av. Salvador Allende Nr. 60, Maputo</span>
                    </div>
                    <div className="flex items-center text-blue-700">
                      <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                      <div>
                        <div>WhatsApp: 83 430 3184</div>
                        <div>Chamadas: 87 008 8787</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Aceitação */}
                <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200 text-center">
                  <p className="text-green-700 text-sm font-medium">
                    Ao utilizar os nossos serviços, você reconhece que leu e compreendeu esta 
                    Política de Privacidade e concorda com os seus termos.
                  </p>
                </div>
              </div>
            </div>

            {/* Rodapé do modal */}
            <div className="sticky bottom-0 p-4 border-t bg-white flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Unitec Moçambique, Lda. • NUIT: 401522050
              </div>
              <button
                onClick={closeModal}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}