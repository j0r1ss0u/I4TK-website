import React from 'react';

const PRAI = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white/30 backdrop-blur-sm rounded-lg p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Disinformation during Elections, how to assist Media/Digital Regulators?
        </h1>

        <div className="space-y-8">
          {/* Universidad de Chile Block */}
          <div className="bg-white/50 rounded-lg p-6">
            <div className="flex gap-6">
              <img src="public/assets/PRAI/universidad de Chile.png" alt="Universidad de Chile logo" className="w-48 h-48 object-contain" />
              <div>
                <h3 className="font-semibold text-xl mb-4">
                  Un análisis sobre la desinformación en procesos electorales en Chile / Analyses of disinformation during electoral processes
                </h3>
                <p className="text-gray-600 mb-2">
                  Este informe aborda el fenómeno de la Desinformación (general y en el contexto nacional), 2 versions en{' '}
                  <a href="https://drive.google.com/file/d/1Onkr25GT1lBux7UvbImc6-kkNcIAg6Aj/view" className="text-blue-600 hover:text-blue-800 underline">español</a>
                  {' '}- in{' '}
                  <a href="https://drive.google.com/file/d/1gx3gYZLbw1y4-0-pg7GTDudtQKcvh_Fk/view" className="text-blue-600 hover:text-blue-800 underline">English</a>
                </p>
                <p className="text-gray-600">
                  Este informe entrega recomendaciones y orientaciones en materia de política pública, 2 versions en{' '}
                  <a href="https://drive.google.com/file/d/1Z1ltfciZIX7aK1S1zRJQEJU42vNjLrzf/view" className="text-blue-600 hover:text-blue-800 underline">español</a>
                  {' '}- in{' '}
                  <a href="https://drive.google.com/file/d/1JqqYP4WrAnGJcomluGor4PrxVvTwT1tT/view" className="text-blue-600 hover:text-blue-800 underline">English</a>
                </p>
              </div>
            </div>
          </div>

          {/* CELE Block */}
          <div className="bg-white/50 rounded-lg p-6">
            <div className="flex gap-6 mb-4">
              <img src="public/assets/PRAI/cele uni parlermo logo rond.jpg" alt="CELE logo" className="w-48 h-24 object-contain" />
              <h3 className="font-semibold text-xl">
                Desinformación digital : la nueva normalidad? Estudios desde Argentina / Digital disinformation : the New normal?
              </h3>
            </div>
            <div className="space-y-2">
              <a href="https://www.palermo.edu/Archivos_content/2021/cele/papers/Disinformation-and-Content-Control.pdf" 
                 className="block text-blue-600 hover:text-blue-800">
                - The New Normal? Disinformation and Content Control on Social Media during COVID-19
              </a>
              <a href="https://www.palermo.edu/Archivos_content/2021/cele/papers/Disinformation-in-democracy%2520(2).pdf" 
                 className="block text-blue-600 hover:text-blue-800">
                - Disinformation in democracy or the democracy of disinformation?
              </a>
              <a href="https://www.palermo.edu/Archivos_content/2021/cele/papers/Disinformation-and-public-officials.pdf" 
                 className="block text-blue-600 hover:text-blue-800">
                - Are public officials' lies unsustainable or do they have far reaching effects?
              </a>
              <a href="https://www.palermo.edu/Archivos_content/2021/cele/papers/Fake-news-on-the-Internet-2021.pdf" 
                 className="block text-blue-600 hover:text-blue-800">
                - Fake news on the Internet: actions and reactions of three platforms
              </a>
            </div>
          </div>

          {/* PRAI Block */}
          <div className="bg-white/50 rounded-lg p-6">
            <div className="flex gap-6 mb-4">
              <img src="public/assets/PRAI/PRAI.jpg" alt="PRAI Open Session" className="w-64 h-32 object-contain" />
              <div>
                <h3 className="font-semibold text-xl mb-2">
                  Jornada abierta PRAI
                </h3>
                <p className="font-medium">
                  "Comunicación y Democracia: ¿Quién regula la verdad?"
                </p>
                <p className="text-sm text-gray-600">11/07/2024</p>
                <p className="text-sm text-gray-600">8:00h México/9:00h Bogotá/10:00h Santiago de Chile/16:00h Barcelona</p>
              </div>
            </div>
            <div className="space-y-4">
              <p>
                Find our contribution in{' '}
                <a href="https://drive.google.com/file/d/1CczrLgPEr2WZFm6nAam05jIG847hjTV6/view" className="text-blue-600 hover:text-blue-800 underline">Español</a>
                {' '}and in{' '}
                <a href="https://drive.google.com/file/d/1JYl7uNMykbnX0ywTQt42XAKdEn2FXCsm/view" className="text-blue-600 hover:text-blue-800 underline">English</a>
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600">
                <li>
                  <strong>1st Question - disinformation and electoral process:</strong>
                  {' '}we need to protect this process. The Electoral Authority is the 1st to be affected, 
                  like the referee when a team loses an important football match.
                </li>
                <li>
                  <strong>2nd Question - News hacking:</strong>
                  {' '}Medias must watch out not to amplify and propagate disinformation despite their competition for audience. 
                  Disinformation is like wildfire, it's more resource-efficient for firefighters to cut short any access the fire would use to spread.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PRAI;