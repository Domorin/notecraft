import { LoadableNote } from "./note";
import { Sidebar } from "./sidebar";

export default function MainPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-base-300">
      <div className="flex w-3/4 h-3/4 rounded-lg overflow-hidden shadow-lg">
        <div className="bg-base-200 p-8">
          <Sidebar />
        </div>
        <div className="bg-base-100 flex-grow p-8">
          <LoadableNote />
        </div>
      </div>
    </div>
  );
}
