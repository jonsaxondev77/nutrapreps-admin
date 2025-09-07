import PagesTable from "./PagesTable";



export default function PagesPage() {
    
    const frontEndUrl = process.env.FRONTEND_URL || 'http://web.localhost:3001'
    console.log(frontEndUrl);

    return <PagesTable frontEndUrl={frontEndUrl} />;
}