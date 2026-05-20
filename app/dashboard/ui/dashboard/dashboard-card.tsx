"use client"

import {CategoryCard} from "@/components/category-card";
import {PersonnelDetailModal} from "@/components/personnel-detail-modal";
import {useState} from "react";
import {Category} from "@/lib/data";
import {
    Staff,
    KategoriStaff,
} from '@/lib/definitions';

export default function Overview({
                                     kategori_staffs,
                                 }: {
    kategori_staffs: KategoriStaff[];
}) { // Make component async, remove the props
    const [selectedCategory, setSelectedCategory] = useState<KategoriStaff | null>(null)

    return (
        <div>
            <main className="flex-1 p-6 space-y-6">

                {/* Categories Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                      <div>
                          <h2 className="text-lg font-semibold text-foreground">Kategori Staff</h2>
                          <p className="text-sm text-muted-foreground">Pilih kategori untuk melihat detail personnel</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {kategori_staffs.map((kategori_staff) => (
                          <CategoryCard key={kategori_staff.id_kategori_staff} kategori_staff={kategori_staff} onSelect={setSelectedCategory} />
                      ))}
                  </div>
                </div>
            </main>

            <PersonnelDetailModal kategori_staff={selectedCategory} onClose={() => setSelectedCategory(null)} />
        </div>
    );
}
