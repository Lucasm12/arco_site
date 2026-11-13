/* ==========================================================================
   Arco · Configuração do site
   Único lugar para ligar o formulário, os contatos e a medição.
   Campo vazio = recurso desligado: nada provisório aparece para o visitante.
   ========================================================================== */
window.ARCO_CONFIG = {
  /* Para onde os formulários enviam (POST com FormData; resposta em JSON).
     Formspree: 'https://formspree.io/f/SEU_ID' · Basin: 'https://usebasin.com/f/SEU_ID' · ou endpoint próprio.
     TODO: preencher antes de divulgar o site. Enquanto estiver vazio, o envio é simulado
     só em localhost; no ar, o visitante vê a mensagem de erro (nenhum pedido se perde em silêncio). */
  formEndpoint: '',

  /* Login (entrar.html). O formulário faz um POST comum (não JSON) para acesso.endpoint, com os campos
     perfil ('professor' ou 'aluno'), email, senha e lembrar ('1' quando marcado). O app autentica e
     redireciona para a área do perfil. Se recusar, devolva o visitante para
     entrar.html?perfil=<perfil>&erro=credenciais (ou erro=sessao, quando a sessão expirar).
     Vazio: em localhost o login é simulado; no ar, o visitante vê "acesso ainda não disponível". */
  acesso: {
    endpoint: '',       // TODO: URL HTTPS de login do app, ex.: 'https://app.arco.com.br/entrar'
    recuperarSenha: ''  // TODO: página "Esqueci minha senha" do app. Vazio = link oculto
  },

  contato: {
    email: '',     // TODO: e-mail comercial, ex.: 'contato@arco.com.br'
    whatsapp: '',  // TODO: só dígitos, com 55 + DDD, ex.: '5586999999999'
    whatsappMensagem: 'Olá! Vim pelo site do Arco e quero conhecer a plataforma.',
    instagram: '', // TODO: URL completa do perfil
    linkedin: '',  // TODO: URL completa da página
    youtube: ''    // TODO: URL completa do canal (opcional)
  },

  /* Medição de audiência. Só carrega depois que o visitante aceita no aviso de privacidade.
     provedor: 'plausible' (sem cookies) ou 'ga4'.
     id: no Plausible, o domínio cadastrado (ex.: 'arcosite.vercel.app'); no GA4, 'G-XXXXXXXXXX'.
     Vazio = sem medição e sem aviso. */
  analytics: {
    provedor: '', // TODO: escolher o provedor
    id: '',
    src: ''       // opcional (Plausible): URL do script, se o painel indicar uma diferente de https://plausible.io/js/script.js
  }
};
