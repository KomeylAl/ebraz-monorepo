import React from 'react';
import { MdOutlinePerson } from 'react-icons/md';

interface CommentItemProps {
   name: string;
   comment: string;
}

const CommentItem = ({ name, comment }: CommentItemProps) => {
  return (
    <div className='w-80 bg-white rounded-md shadow-lg flex items-center gap-4 p-4'>
      <div className='w-20 h-20 rounded-full bg-gray-100 border-2 border-white shadow-lg flex items-center justify-center'>
         <MdOutlinePerson size={40} className='text-gray-500'/>
      </div>
      <div className='text-right flex flex-col items-start justify-center gap-2'>
         <p className='font-semibold'>{name}</p>
         <p className='text-sm'>{comment}</p>
      </div>
    </div>
  )
}

export default CommentItem
