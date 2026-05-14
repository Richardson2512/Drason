import { redirect } from 'next/navigation';

// The standalone "Sequence preview" page was renamed to "Sequence schema"
// and relocated inside each campaign at /campaigns/[id]/sequence. This
// route now redirects to the campaigns list so any existing links don't
// 404.
export default function SequencePreviewRedirect() {
    redirect('/dashboard/linkedin/campaigns');
}
