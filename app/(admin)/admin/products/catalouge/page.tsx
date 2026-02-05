import { Card, CardContent } from "@/components/ui/card";
import React from "react";

const page = () => {
  return (
    <div className="space-y-4">
      <div className="bg-orange-500 w-full py-5 justify-center items-center text-center text-3xl text-white uppercase">
        HINI
      </div>
      
      <div>Cabinet Handle</div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent></CardContent>
        </Card>
        <Card>
          <CardContent></CardContent>
        </Card>
        <Card>
          <CardContent></CardContent>
        </Card>
        <Card>
          <CardContent></CardContent>
        </Card>
      </div>

      <div>Door Handle</div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent></CardContent>
        </Card>
        <Card>
          <CardContent></CardContent>
        </Card>
        <Card>
          <CardContent></CardContent>
        </Card>
        <Card>
          <CardContent></CardContent>
        </Card>
      </div>
      
    </div>
  );
};

export default page;
