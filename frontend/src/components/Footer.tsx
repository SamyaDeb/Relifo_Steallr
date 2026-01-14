import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">Relifo</h3>
            <p className="text-sm text-gray-400">
              Transparent disaster relief powered by Stellar blockchain. 
              Every donation tracked, every fund accounted.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/campaigns" className="text-sm hover:text-white transition-colors">
                  Active Campaigns
                </Link>
              </li>
              <li>
                <Link href="/donor" className="text-sm hover:text-white transition-colors">
                  Donate
                </Link>
              </li>
              <li>
                <Link href="/ngo/register" className="text-sm hover:text-white transition-colors">
                  Register as NGO
                </Link>
              </li>
              <li>
                <Link href="/beneficiary/apply" className="text-sm hover:text-white transition-colors">
                  Apply for Aid
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/docs" className="text-sm hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <a 
                  href="https://stellar.org" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Stellar Network
                </a>
              </li>
              <li>
                <a 
                  href="https://www.freighter.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Get Freighter Wallet
                </a>
              </li>
              <li>
                <a 
                  href="https://stellar.expert" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors"
                >
                  Stellar Explorer
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Network
            </h4>
            <ul className="space-y-2">
              <li className="text-sm">
                <span className="inline-flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Stellar Testnet
                </span>
              </li>
              <li className="text-sm">
                <span className="text-gray-400">Asset: </span>
                <span className="font-mono">USDC</span>
              </li>
              <li className="text-sm">
                <span className="text-gray-400">Issuer: </span>
                <span className="font-mono text-xs">GBBD47...LLA5</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {currentYear} Relifo. Built for Stellar Hackathon.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Twitter
            </a>
            <a 
              href="https://discord.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Discord
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
